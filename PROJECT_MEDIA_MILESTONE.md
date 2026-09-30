# Project media lifecycle milestone

## Deployment

Apply `supabase/migrations/202609290001_project_media_lifecycle.sql` before deploying this code. It adds nullable `thumbnail_path`, preserves/enforces the project-to-clips cascade, and restricts browser access to owned reads and provisional project creation. Browser lifecycle updates, direct deletion, clip writes and clips-bucket access are denied. Service-role credentials remain backend-only. No new status or historical cleanup is introduced.

Run from `frontend` after applying the migration:

```powershell
node scripts/verify-media-lifecycle.mjs
```

This creates disposable auth/project/clip/Storage fixtures, checks ownership, write/delete restrictions, clip counts, private storage and actual cascading deletion, then removes only those fixtures. It sends no emails. It never deletes historical project data.

The pre-migration live check confirmed that project deletion already cascades to clips. It also found that browser users could update their own project status and delete their own projects. The migration is required to close those bypasses; application filters are not the security boundary.

## Behavior

The browser creates a provisional project. Processing prepares the local source, extracts a JPEG frame at `min(5s, 10% of duration)`, generates and persists clips, uploads `thumbnail.jpg`, and stores the thumbnail path with `status=done`. The normal library queries completed projects only and obtains clip counts through the owned database relationship. A batch FastAPI endpoint authorizes thumbnail access. Missing legacy thumbnails display “Thumbnail unavailable”; no video player is used as an image.

Processing failure joins active blocking writes, marks the attempt unsuccessful, enumerates its verified owner/project Storage namespace, removes those objects, then deletes the project with cascading clip deletion. Intended upload paths are recorded before upload, so an object does not need a clip row to be cleaned up. Local files are removed independently. Original processing errors and cleanup errors have separate SSE fields. An ambiguous final database write is read back before destructive cleanup; confirmed completed results are preserved.

Delete Project requires confirmation. FastAPI verifies ownership and completed status, removes namespace objects, and deletes metadata last. The card remains until confirmed success. Failure retains the card and explains that some files may already have been removed. No `deleting` status or automatic retry is used.

## Limits

- Storage and database operations are not one distributed transaction. Partial deletion can leave a completed project with missing media; the UI reports this instead of claiming success. A manual deletion request can be repeated.
- A hard crash, unavailable remote service, or a project created before a processing request reaches the server can leave provisional/error records or files. There is no recovery worker or automatic retry. These records are excluded from the normal library.
- Request-owned blocking work is awaited before cancellation cleanup. This may delay cancellation while a media/network operation completes; it does not make hard process termination recoverable.
- The project-operation guard is for the current single-process MVP server. Multi-worker deployment requires a database-backed concurrency claim before enabling concurrent writes; the in-process guard is not a distributed lock.
- Existing signed URLs and cached/downloaded media cannot be recalled from users' devices.
- Gemini analysis uploads retain their existing lifecycle; this milestone cleans Cliprol's Storage, database and local processing resources.

## Historical inventory and proposed cleanup (not executed)

Read-only inventory on 2026-09-29 found **2 historical `error` projects, 0 clip rows, 0 Storage objects, 0 thumbnails, 0 bytes** under their namespaces. This does not assert that unrelated orphan namespaces or stale `processing` rows are absent.

To refresh counts without deleting anything:

```powershell
node scripts/verify-media-lifecycle.mjs --inventory
```

After separate approval, prepare an exact allowlist of those historical project IDs and owners, recheck each still has `status=error`, display a dry-run resource inventory, then invoke the tested shared cleanup service once per approved project. Confirm namespace emptiness and cascading metadata removal. Stop/report individual failures; do not broaden the selection to `processing` or `done`. No startup or page-load cleanup is installed.

## Real-browser verification

Check responsive grid sizes, actual signed image/video playback and downloads, keyboard/focus behavior of the native confirmation dialog, Cancel and Delete flows, deletion errors, login/account changes and deployed SPA deep-link refresh. Test a fresh URL and upload project against the migrated database. Verify an intentionally failed processing attempt is absent from both the library and its owned resources.

## Verification results

- Backend: 58 tests passed, including real source-video/JPEG extraction.
- Frontend: 36 tests passed, including confirmation/cancel, failed deletion, grid states, missing images and interrupted SSE.
- Production build passed; Vite reports a non-blocking 500 kB chunk-size warning.
- Lint for files touched in this milestone and `git diff --check` passed.
- Live pre-migration verification: cascade, owner read isolation, anonymous read denial, private bucket and browser Storage deletion denial passed. Missing `thumbnail_path`, browser status updates and browser project deletion failed the intended deployment contract. The migration must be applied and the live checker rerun before deployment.
- SQL application/post-migration verification is pending: this workspace has Supabase service-role API credentials, but no database connection or management credentials capable of applying SQL.

## Files changed in this milestone

Backend:

- `backend/services/project_cleanup.py` (new), `blocking.py` (new), `project_operations.py` (new), `processing_service.py`, `project_service.py`, `supabase_storage.py`
- `backend/editor/thumbnail.py` (new), `backend/editor/editor.py`, `backend/detector/detector.py`
- `backend/routes/projects.py` (new), `backend/routes/processing.py`, `backend/routes/clips.py`, `backend/helpers/sse.py`, `backend/main.py`
- `backend/tests/test_project_media.py` (new), `test_processing_persistence.py`, `test_upload_processing.py`, `test_clip_access.py`

Frontend:

- `frontend/src/components/ProjectCard.tsx` (new)
- `frontend/src/pages/dashboard/DashboardProjects.tsx`, `frontend/src/pages/ProcessingPage.tsx`
- `frontend/src/lib/api.ts`, `frontend/src/lib/supabase/project.ts`, `frontend/src/types.ts`
- `frontend/tests/project-history.test.tsx`, `frontend/tests/project-queries.test.ts`
- `frontend/scripts/verify-media-lifecycle.mjs` (new)

Migration and documentation:

- `supabase/migrations/202609290001_project_media_lifecycle.sql` (new)
- `PROJECT_MEDIA_MILESTONE.md` (new)
