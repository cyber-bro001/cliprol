"""Video processing workflow independent from FastAPI HTTP concerns."""

import asyncio
import os
import shutil
import uuid
from collections.abc import AsyncIterator

ProcessingEvent = tuple[str, dict]

DEFAULT_STORAGE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "videos")
BASE_STORAGE = os.path.abspath(os.getenv("STORAGE_PATH", DEFAULT_STORAGE))


def create_job_folder() -> str:
    """Create and return an isolated temporary directory for one processing job."""
    os.makedirs(BASE_STORAGE, exist_ok=True)
    folder = os.path.join(BASE_STORAGE, str(uuid.uuid4()))
    os.makedirs(folder, exist_ok=True)
    return folder


async def process_url_video(
    url: str,
    user_id: str,
    project_id: str,
) -> AsyncIterator[ProcessingEvent]:
    """Download, analyze, create, upload, and clean up clips for a URL."""
    # Keep application startup independent from optional/heavy media SDK imports.
    # These domain modules remain the owners of download, detection, and editing.
    from detector.detector import detect_moments_with_progress
    from downloader.downloader import download_video
    from editor.editor import create_clip
    from services.supabase_storage import upload_clip

    folder = create_job_folder()

    try:
        try:
            video = await asyncio.to_thread(download_video, url, folder)
        except Exception:
            yield ("error", {"message": "Could not download video. Please check the URL is valid and try again."})
            return

        yield ("progress", {"message": "Preparing video"})
        try:
            moments = None
            async for kind, payload in detect_moments_with_progress(video):
                if kind == "progress":
                    yield ("progress", {"message": payload})
                elif kind == "result":
                    moments = payload
        except Exception:
            yield ("error", {"message": "Unable to analyze video. This may be due to video format, duration, or content restrictions. Please try a different video."})
            return

        if not moments:
            yield ("error", {"message": "No interesting moments found in this video. Try uploading a longer video with more varied content."})
            return

        clips = []
        for index, moment in enumerate(moments):
            start_time = moment["start"]
            end_time = moment["end"]
            yield ("progress", {"message": f"Creating clip {index + 1} of {len(moments)}"})

            try:
                clip_path = await asyncio.to_thread(create_clip, video, start_time, end_time, folder)
                if clip_path:
                    storage_path = f"{user_id}/{project_id}/clip-{index + 1}.mp4"
                    await asyncio.to_thread(upload_clip, clip_path, storage_path)
                    clips.append({
                        "video": storage_path,
                        "start": start_time,
                        "end": end_time,
                        "reason": moment.get("reason", ""),
                    })
            except Exception:
                yield ("error", {"message": "Failed to create clips. This may be a temporary issue. Please try again."})
                return

        if not clips:
            yield ("error", {"message": "No valid clips could be created from the detected moments. Please try another video."})
            return

        yield ("progress", {"message": "Finalizing"})
        yield ("success", {
            "status": "success",
            "moments_detected": len(moments),
            "clips": clips,
            "moments": moments,
        })
    except Exception:
        yield ("error", {"message": "An unexpected error occurred. Please try again later."})
    finally:
        shutil.rmtree(folder, ignore_errors=True)
