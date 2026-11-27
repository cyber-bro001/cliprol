"""Video processing workflow independent from FastAPI HTTP concerns."""

import logging
import os
import re
import shutil
import time
import uuid
from collections.abc import AsyncIterator, Callable
from contextlib import aclosing
from pathlib import Path
from typing import BinaryIO

from services.clip_service import persist_clip
from services.project_service import update_project_status, project_completed, require_processing_project
from services.project_cleanup import cleanup_project
from services.blocking import run_blocking
from services.project_operations import project_operation, ProjectBusy

logger = logging.getLogger(__name__)
ProcessingEvent = tuple[str, dict]
DEFAULT_STORAGE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "videos")
BASE_STORAGE = os.path.abspath(os.getenv("STORAGE_PATH", DEFAULT_STORAGE))


def create_job_folder() -> str:
    """Create and return an isolated temporary directory for one processing job."""
    os.makedirs(BASE_STORAGE, exist_ok=True)
    folder = os.path.join(BASE_STORAGE, str(uuid.uuid4()))
    os.makedirs(folder, exist_ok=True)
    return folder


async def process_url_video(url: str, user_id: str, project_id: str, *, client=None) -> AsyncIterator[ProcessingEvent]:
    def prepare_source(folder: str) -> tuple[str, str | None]:
        from downloader.downloader import download_video
        return download_video(url, folder)

    try:
        with project_operation(project_id):
            try:
                await run_blocking(require_processing_project, project_id, user_id, client=client)
            except Exception:
                yield ('error', {'message': 'This project could not be started. Check Projects before starting a new project.'})
                return
            async with aclosing(_process_video(
                prepare_source, user_id, project_id,
                "Could not download the video. It may be unavailable, or YouTube may be temporarily unreachable. Please try again.",
                source_progress_message="Downloading video",
                client=client,
            )) as processing:
                async for event in processing:
                    yield event
    except ProjectBusy:
        yield ('error', {'message': 'This project is already being processed.'})


def save_uploaded_source(source: BinaryIO, folder: str, filename: str) -> str:
    """Copy in bounded chunks; preserve only a safe extension, never a client path."""
    suffix = Path(filename).suffix.lower()
    if len(suffix) > 16 or not suffix[1:].isalnum():
        suffix = ""
    path = os.path.join(folder, f"source{suffix}")
    source.seek(0)
    with open(path, "wb") as destination:
        shutil.copyfileobj(source, destination, length=1024 * 1024)
    if os.path.getsize(path) == 0:
        raise ValueError("Uploaded video is empty")
    return path


async def process_uploaded_video(
    source: BinaryIO, user_id: str, project_id: str, filename: str = "source.mp4",
    *, client=None,
) -> AsyncIterator[ProcessingEvent]:
    try:
        with project_operation(project_id):
            try:
                await run_blocking(require_processing_project, project_id, user_id, client=client)
            except Exception:
                yield ('error', {'message': 'This project could not be started. Check Projects before starting a new project.'})
                return
            async with aclosing(_process_video(
                lambda folder: (save_uploaded_source(source, folder, filename), readable_upload_title(filename)),
                user_id, project_id, "Failed to save the uploaded video.",
                source_progress_message="Saving uploaded video",
                client=client,
            )) as processing:
                async for event in processing:
                    yield event
    except ProjectBusy:
        yield ('error', {'message': 'This project is already being processed.'})


def readable_upload_title(filename: str) -> str | None:
    """Clean client filenames without rewriting existing capitalization/acronyms."""
    basename = filename.replace('\\', '/').rsplit('/', 1)[-1]
    stem = Path(basename).stem
    title = ' '.join(re.sub(r'[_-]+', ' ', stem).split())
    if not any(character.isalnum() for character in title):
        return None
    return ' '.join(word[:1].upper() + word[1:] for word in title.split())


async def _process_video(
    prepare_source: Callable[[str], tuple[str, str | None]], user_id: str, project_id: str,
    preparation_error: str, *, source_progress_message: str, client=None,
) -> AsyncIterator[ProcessingEvent]:
    """Commit complete projects; synchronously compensate unsuccessful attempts."""
    folder = None
    completed = False
    completion_attempted = False
    failure = None
    cleanup_errors = []
    attempted_paths = []
    clips = []
    failure_message = "Unable to start project processing."
    try:
        await run_blocking(update_project_status, project_id, user_id, "processing", client=client)

        # Keep startup independent from heavy media SDK imports.
        from detector.detector import detect_moments_with_progress
        from editor.editor import create_clip
        from editor.thumbnail import create_thumbnail
        from services.supabase_storage import upload_clip, upload_thumbnail

        folder = create_job_folder()
        failure_message = preparation_error
        yield ("progress", {"message": source_progress_message})
        stage_started = time.perf_counter()
        video, title = await run_blocking(prepare_source, folder)
        logger.info("Source preparation for project %s took %.1f seconds", project_id, time.perf_counter() - stage_started)
        # Missing/unusable metadata preserves the provisional database title.
        title = ' '.join(title.split()) if isinstance(title, str) else None
        if title and not any(character.isalnum() for character in title):
            title = None

        failure_message = 'Unable to create the project thumbnail.'
        stage_started = time.perf_counter()
        thumbnail = await run_blocking(create_thumbnail, video, folder)
        logger.info("Thumbnail creation for project %s took %.1f seconds", project_id, time.perf_counter() - stage_started)

        yield ("progress", {"message": "Preparing video"})
        failure_message = "Unable to analyze video."
        moments = None
        stage_started = time.perf_counter()
        async with aclosing(detect_moments_with_progress(video)) as detection:
            async for kind, payload in detection:
                if kind == "progress":
                    yield ("progress", {"message": payload})
                elif kind == "result":
                    moments = payload
        logger.info("Moment detection for project %s took %.1f seconds", project_id, time.perf_counter() - stage_started)
        if not moments:
            failure_message = "No interesting moments found in this video."
            raise ValueError(failure_message)

        for index, moment in enumerate(moments):
            failure_message = f"Failed to create clip {index + 1}."
            yield ("progress", {"message": f"Creating clip {index + 1} of {len(moments)}"})
            stage_started = time.perf_counter()
            created = await run_blocking(create_clip, video, moment["start"], moment["end"], folder)
            if created is None:
                # A single bad/too-short detector range should not discard
                # clips already created or prevent later valid moments.
                logger.warning(
                    "Skipping detected clip %s for project %s: invalid whole-second range (%r–%r)",
                    index + 1,
                    project_id,
                    moment.get("start"),
                    moment.get("end"),
                )
                continue
            logger.info("Clip %s render for project %s took %.1f seconds", index + 1, project_id, time.perf_counter() - stage_started)
            clip_path, start_time, end_time = created
            storage_path = f"{user_id}/{project_id}/clip-{index + 1}.mp4"
            failure_message = f"Failed to upload clip {index + 1}."
            attempted_paths.append(storage_path)
            stage_started = time.perf_counter()
            await run_blocking(upload_clip, clip_path, storage_path)
            logger.info("Clip %s upload for project %s took %.1f seconds", index + 1, project_id, time.perf_counter() - stage_started)
            failure_message = f"Failed to save metadata for clip {index + 1}."
            saved = await run_blocking(
                persist_clip, project_id, storage_path, start_time, end_time, moment.get("reason", ""),
                client=client,
            )
            clips.append({
                "video": saved["clip_url"],
                "start": saved["start_time"],
                "end": saved["end_time"],
                "reason": saved.get("reason") or "",
            })

        if not clips:
            failure_message = "No detected moments had a valid whole-second range."
            raise ValueError(failure_message)

        failure_message = 'Unable to upload the project thumbnail.'
        thumbnail_path = f'{user_id}/{project_id}/thumbnail.jpg'
        attempted_paths.append(thumbnail_path)
        await run_blocking(upload_thumbnail, thumbnail, thumbnail_path)
        yield ("progress", {"message": "Finalizing"})
        failure_message = "Clips were saved, but the project could not be marked done."
        completion_attempted = True
        await run_blocking(update_project_status, project_id, user_id, "done", thumbnail_path, title or None, client=client)
        completed = True
    except Exception:
        logger.exception("Processing failed for project %s", project_id)
        failure = failure_message
    finally:
        # Includes generator closure/cancellation. Do not wait for another SSE
        # read to start cleanup, and never delete a confirmed completed project.
        safe_to_cleanup = not completed
        if completion_attempted and not completed:
            try:
                completed = await run_blocking(project_completed, project_id, user_id, client=client)
                safe_to_cleanup = not completed
            except Exception:
                safe_to_cleanup = False
                cleanup_errors.append('Completion could not be verified; saved resources were preserved.')
                logger.exception('Could not verify completion for %s', project_id)
        if safe_to_cleanup:
            try:
                await run_blocking(update_project_status, project_id, user_id, 'error', client=client)
            except Exception:
                logger.exception('Could not mark unsuccessful project %s', project_id)
            try:
                await run_blocking(cleanup_project, user_id, project_id, attempted_paths, client=client)
            except Exception:
                cleanup_errors.append('Remote cleanup could not be completed.')
                logger.exception('Remote cleanup failed for %s', project_id)
        if folder is not None:
            try:
                await run_blocking(shutil.rmtree, folder)
            except Exception:
                cleanup_errors.append('Temporary file cleanup could not be completed.')
                logger.exception('Local cleanup failed for %s', project_id)

    if completed:
        yield ('success', {'status': 'success', 'clips': clips, 'moments_detected': len(clips), 'moments': moments})
    else:
        yield ('error', {'message': failure or failure_message, 'cleanupError': ' '.join(cleanup_errors) or None})
