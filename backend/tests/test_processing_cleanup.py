import asyncio
import sys
import tempfile
import types
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

from services import processing_service
from services.project_cleanup import cleanup_project


USER_ID = "e7d4ce55-5644-43cb-9e8f-44e38644b992"
PROJECT_ID = "a4a5f335-73e0-4733-bbd4-5269d154f17b"


class ProcessingFailureCleanupTests(unittest.IsolatedAsyncioTestCase):
    async def run_download_failure(self, cleanup_error=None, status_error=None):
        client = object()
        temporary_folder = Path(tempfile.mkdtemp()) / "job"
        temporary_folder.mkdir()

        def update_status(*args, **kwargs):
            if args[2] == "error" and status_error is not None:
                raise status_error

        status_update = Mock(side_effect=update_status)
        remote_cleanup = Mock(side_effect=cleanup_error)

        def create_folder():
            return str(temporary_folder)

        async def run_inline(function, *args, **kwargs):
            return function(*args, **kwargs)

        with (
            patch.object(processing_service, "require_processing_project"),
            patch.object(processing_service, "update_project_status", status_update),
            patch.object(processing_service, "cleanup_project", remote_cleanup),
            patch.object(processing_service, "create_job_folder", create_folder),
            patch.object(processing_service, "run_blocking", side_effect=run_inline),
            patch.object(processing_service.logger, "exception"),
            patch("downloader.downloader.download_video", side_effect=RuntimeError("CDN read timeout")),
        ):
            events = [
                event async for event in processing_service.process_url_video(
                    "https://www.youtube.com/watch?v=example",
                    USER_ID,
                    PROJECT_ID,
                    client=client,
                )
            ]

        self.assertEqual(events[0], ("progress", {"message": "Downloading video"}))
        self.assertEqual(events[-1][0], "error")
        self.assertIn("temporarily unreachable", events[-1][1]["message"])
        status_update.assert_any_call(PROJECT_ID, USER_ID, "processing", client=client)
        status_update.assert_any_call(PROJECT_ID, USER_ID, "error", client=client)
        remote_cleanup.assert_called_once_with(USER_ID, PROJECT_ID, [], client=client)
        self.assertFalse(temporary_folder.exists())
        return events

    async def test_url_download_failure_marks_error_and_removes_local_job_folder(self):
        events = await self.run_download_failure()
        self.assertIsNone(events[-1][1]["cleanupError"])

    async def test_remote_cleanup_failure_is_reported_but_local_folder_is_removed(self):
        events = await self.run_download_failure(
            RuntimeError("Supabase unavailable"),
            RuntimeError("Supabase unavailable"),
        )
        self.assertIn("Remote cleanup could not be completed", events[-1][1]["cleanupError"])


class ProjectCleanupTests(unittest.TestCase):
    def test_removes_owned_storage_objects_before_project_metadata(self):
        existing = {
            f"{USER_ID}/{PROJECT_ID}/clip-1.mp4",
            f"{USER_ID}/{PROJECT_ID}/thumbnail.jpg",
        }
        removed = []
        operations = []
        attempted_path = f"{USER_ID}/{PROJECT_ID}/partial-upload.mp4"
        expected_paths = set(existing) | {attempted_path}

        class Bucket:
            def list(self, folder, _options):
                prefix = f"{folder}/"
                return [
                    {"name": path.removeprefix(prefix), "id": "object"}
                    for path in sorted(existing)
                    if path.startswith(prefix)
                ]

            def remove(self, paths):
                operations.append(("storage", "remove"))
                removed.extend(paths)
                existing.difference_update(paths)

        class Query:
            def __init__(self, table):
                self.table_name = table
                self.operation = "select"

            def select(self, _columns):
                self.operation = "select"
                return self

            def delete(self):
                self.operation = "delete"
                return self

            def eq(self, _column, _value):
                return self

            def execute(self):
                operations.append((self.table_name, self.operation))
                if self.table_name != "projects":
                    raise AssertionError(f"Unexpected table: {self.table_name}")
                if self.operation == "delete":
                    self.client.project_exists = False
                    return SimpleNamespace(data=[])
                if self.client.project_exists:
                    return SimpleNamespace(data=[{"id": PROJECT_ID, "user_id": USER_ID}])
                return SimpleNamespace(data=[])

        class Client:
            project_exists = True

            def table(self, name):
                query = Query(name)
                query.client = self
                return query

        storage = SimpleNamespace(storage=SimpleNamespace(from_=lambda _bucket: Bucket()))
        storage_module = types.ModuleType("supabase_folder.supabase_client")
        storage_module.supabase = storage
        client = Client()

        with patch.dict(sys.modules, {"supabase_folder.supabase_client": storage_module}):
            cleanup_project(USER_ID, PROJECT_ID, [attempted_path], client=client)

        self.assertEqual(set(removed), expected_paths)
        self.assertFalse(existing)
        self.assertFalse(client.project_exists)
        storage_remove_index = operations.index(("storage", "remove"))
        delete_index = operations.index(("projects", "delete"))
        self.assertGreater(delete_index, storage_remove_index)


if __name__ == "__main__":
    unittest.main()
