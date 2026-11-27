# Project Debugging and Processing Report

This report covers the work from the initial “You are not authenticated” project-access issue through the video clipping, long-processing, and upload-speed investigation.

## 1. Authentication and project access

### Reported problem

Project and clip requests could return “You are not authenticated” even when the user had signed in. The backend was also catching broad exceptions and mapping different failures to the same authentication response, which made Supabase outages, project-state conflicts, and actual credential failures hard to distinguish.

### Changes made

- Added a request-scoped Supabase client using the caller’s access token for owner-scoped database operations. This avoids relying on a shared client for per-user RLS requests and avoids mutating shared authorization headers between concurrent requests.
- Passed the authenticated client through project lookup, processing lifecycle updates, clip metadata reads/writes, and cleanup operations.
- Kept Storage operations on the backend service client because the existing Storage policy denies direct authenticated access.
- Added explicit project-not-found and project-state-conflict errors, and mapped authentication and upstream Supabase failures to more appropriate HTTP statuses instead of treating every error as an authentication failure.
- Added safer error logging and optional detailed error messages when `DEBUG` is enabled.
- Added `backend/sql/owner_scoped_processing_permissions.sql` with owner-scoped RLS policies and grants needed for project status updates/deletion and clip metadata insertion through the user client.

**Migration status:** The SQL migration was written to the repository; it was not applied to Supabase as part of this work.

## 2. YouTube download and clip-completion failures

### FFmpeg failure

A supplied backend log showed yt-dlp selecting separate video and audio streams, then failing because FFmpeg was not installed or discoverable on the backend `PATH`. The log also warned that Deno was missing; that can limit YouTube extraction, but FFmpeg was the immediate cause of that failed download. The backend setup guide lists FFmpeg and Deno as system dependencies.

### Invalid detected moment

A later log showed clips being rendered before processing failed with `Detected clip has no valid whole-second range`. The editor rounds clip boundaries to whole seconds; a short or malformed detected interval can collapse to an empty range. The processing service previously treated one such moment as fatal and cleaned up the incomplete project.

### Changes made

- Updated `backend/services/processing_service.py` to skip invalid moments, log them, and continue processing subsequent moments. It now fails if no valid clips are produced at all.
- Updated `backend/downloader/downloader.py` to use yt-dlp’s merged source directly, removing a second full-video H.264/AAC re-encode before clip creation.
- Updated `backend/editor/editor.py` to encode clips with FFmpeg’s `veryfast` preset and two threads. This caps peak encoding CPU use; the thread cap can increase single-job wall time, while the faster preset can increase output file size.

## 3. Long-video processing and upload time

### Reported experience

A video around 30 minutes can take roughly 25 minutes or longer to process. Some jobs stop or hang and do not reliably return all clips. Local processing also heats the computer.

### Findings

- The backend uploads the full video to Gemini after it has been received from the browser or downloaded from YouTube. For uploaded files, that is a second transfer after the browser-to-backend upload.
- Gemini file upload, Gemini’s subsequent video-processing wait, and model moment analysis are separate stages. A large file and slow internet **upload** bandwidth can make transfer take a long time. For scale, a 30-minute video encoded at 8 Mbps is about 1.8 GB; sending 1.8 GB over a 10 Mbps upload link takes about 24 minutes in ideal conditions.
- The code uses `gemini-2.5-flash` to analyze the full source. Local clip encoding is CPU-intensive; the longer the output clips and the more clips generated, the more work the machine must do.
- Processing runs inside the HTTP/SSE request. The in-memory project lock only coordinates requests within one backend process. A background job queue would improve workload management and multi-user handling, but would not by itself make one video analyze faster.

### Changes made

- Added stage timing logs for source preparation, thumbnail creation, overall moment detection, clip rendering, and clip uploads in `backend/services/processing_service.py`.
- Added Gemini upload, video-file processing, and model-analysis timing logs in `backend/detector/detector.py`.
- Added a 20-minute timeout for each Gemini HTTP request and a 60-minute cap on waiting for Gemini’s uploaded video to reach its processed state. Gemini failed/non-active file states now raise an explicit error. These limits help reveal or end some stalls; they do not create a total job deadline or guarantee faster processing.

## 4. Performance options discussed, not implemented

- For supported public YouTube videos, pass the YouTube URL to Gemini for analysis while separately downloading the source for clip creation. This may avoid uploading a duplicate video from the backend to Gemini, but requires a compatible Gemini API flow and does not work for every video’s privacy/access state.
- For user uploads, create a lower-bitrate analysis copy and retain the original for final clips. Smaller files transfer faster, but creating the copy uses local CPU and reducing resolution/bitrate can lose visual detail.
- Lower frame sampling can reduce Gemini’s analysis workload after upload, but does not make the file transfer itself faster and can miss brief visual moments.
- Move processing into a durable background queue with separate workers for reliable long jobs and controlled concurrency. This is a later architecture step; it will not directly reduce the latency of one video.

## 5. Verification and remaining work

- No tests or end-to-end video runs were performed during this work.
- The SQL migration has not been applied to Supabase.
- The new timing logs need to be collected from one representative long-video run before choosing the next optimization. They should show whether the dominant time is source preparation, Gemini upload, Gemini video processing, model analysis, clip rendering, or clip upload.
- Several other files in the workspace are modified beyond the processing-related changes listed here. This report describes the authentication and processing changes visible in the workspace and does not claim that every modified file was part of this debugging thread.
