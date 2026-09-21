# Cliprol Project Guide (Beginner Friendly)

This is a simple guide for anyone starting on this project. The goal is to help a new developer understand what the app does, how it works, and where to start.

## 1. What this project is

Cliprol is a web app that takes a long video and finds the best short moments in it.

Example flow:

1. A user pastes a YouTube link or uploads a video.
2. The backend downloads or reads the video.
3. AI looks through the video and finds moments that feel interesting.
4. The app cuts those moments into short clips.
5. The clips are stored in cloud storage.
6. The frontend shows the clips to the user.

In simple terms: this project is an AI-powered video clipping tool.

---

## 2. What the app is trying to do

A creator may have a long video and want:

- short clips for TikTok, Reels, or YouTube Shorts
- the most interesting parts only
- less manual editing work

The app tries to do the boring part automatically:

- detect exciting moments
- cut the right ranges
- generate clips
- save results for the user

---

## 3. High-level architecture

This project has two main parts:

- Frontend: what the user sees and interacts with
- Backend: the logic that processes video, talks to AI, uploads clips, and handles auth

The project also uses:

- Supabase for login and storage
- Gemini AI for detecting interesting moments
- ffmpeg + moviepy for video editing
- yt-dlp to download videos from links

Think of it like this:

Frontend -> Backend -> AI/Video Tools -> Supabase Storage

---

## 4. Project folders and what they do

### Root folder

The root contains:

- `frontend/` — user interface
- `backend/` — server and media processing
- `.gitignore` — Git ignore rules

### Backend folders

#### `backend/main.py`
This is the startup file for the Python server. It creates the FastAPI app and connects the API routes.

#### `backend/routes/processing.py`
This file defines the API endpoints. These are the URLs the frontend uses when the user starts video processing.

Important routes:

- `POST /process-url` — processes a YouTube link
- `POST /upload-video` — meant for uploaded videos, but not fully implemented yet

#### `backend/services/processing_service.py`
This is the real engine of the app.

It does the following:

- creates a temporary folder for a job
- downloads the video
- sends it to AI for analysis
- extracts the best segments
- creates clips
- uploads clips to Supabase
- sends progress updates back to the frontend

#### `backend/detector/detector.py`
This file is responsible for AI detection.

It uses Gemini to look at the video and return moments like:

- start time
- end time
- why this moment is interesting

#### `backend/downloader/downloader.py`
This file downloads the video from a URL.

It uses `yt_dlp` to fetch the video and then uses `ffmpeg` to turn it into a clean MP4.

#### `backend/editor/editor.py`
This file cuts a video into a smaller clip using the start and end times found by Gemini.

#### `backend/services/supabase_storage.py`
This file uploads clip files to Supabase storage.

#### `backend/services/project_service.py`
This file checks whether the user is allowed to process a project.

#### `backend/helpers/sse.py`
This file creates server-sent events (SSE), which are a way to send updates while a long task is running.

Example events:

- progress
- success
- error

#### `backend/supabase_folder/`
This holds the backend-side Supabase client for server tasks like auth validation and file uploads.

---

## 5. Frontend folders

### `frontend/src/main.tsx`
This is the entry point for the web app.

It:

- starts React
- wraps the app in a router
- sets up app-wide context
- shows the main app

### `frontend/src/App.tsx`
This file handles all routes.

Examples:

- `/` → landing page
- `/login` → login page
- `/signup` → signup page
- `/dashboard/new-project` → create a new processing job
- `/dashboard/process/:projectId` → processing screen
- `/dashboard/projects/:projectId` → results page

### `frontend/src/context/CliprolContext.tsx`
This is the app’s main state manager.

It keeps global data like:

- current session
- whether processing is running
- video URL
- uploaded file
- the clips found after processing
- error messages

This file acts like the app’s central brain.

### `frontend/src/lib/`
This folder contains helper logic.

Examples:

- API calls
- Supabase auth helpers
- URL validation logic
- project logic
- clip logic

### `frontend/src/pages/`
This folder contains the main pages.

Examples:

- LandingPage
- LoginPage
- SignupPage
- ProcessingPage
- ResultsPage
- Dashboard pages

### `frontend/src/components/`
This folder contains reusable UI blocks like:

- Header
- Footer
- InputSection
- ProcessingState
- ClipCard
- FAQ

---

## 6. How the app works from the user side

### Step 1: User opens the app
The user lands on the homepage and sees the landing screen.

### Step 2: User chooses input type
The user can choose either:

- YouTube link
- Upload video

### Step 3: User signs in
The app uses Supabase authentication.

The user may:

- create an account
- login with email and password

### Step 4: User creates a project
When they submit a video or link, the app creates a project record in the database.

The project stores things like:

- project title
- input type
- source URL
- user who owns it
- status

### Step 5: Processing starts
The frontend sends the request to the backend.

The backend validates the user and project ownership, then begins processing.

### Step 6: The backend works in stages
This is the real processing lifecycle:

1. Download video
2. Analyze video with AI
3. Find the best moments
4. Cut video into clips
5. Upload clips to storage
6. Return results

### Step 7: Frontend shows progress
The frontend receives live updates using SSE

Example progress messages:

- Preparing video
- Uploading video for analysis
- Analyzing video content...
- Generating the best moments
- Finalizing

### Step 8: Results are displayed
When the processing is done, the user sees a list of clips with:

- start and end times
- reason the moment is interesting
- a playable video preview
- a download button

---

## 7. How the backend works in plain English

The backend is the brain of the project.

It follows a simple pipeline:

### 1) User request arrives
A frontend request goes to `/process-url`.

### 2) Token is checked
The app checks if the user is logged in and if they own the project.

If not, the request fails.

### 3) A new job folder is created
The app makes a temporary folder to hold downloaded and processed files.

### 4) Video is downloaded
The downloader uses `yt_dlp` to get the source video.

### 5) AI analyzes the video
Gemini looks at the video and decides where the best parts are.

### 6) Clip extraction happens
For each good moment, the app cuts out a smaller video portion.

### 7) Files are uploaded
Each clip gets uploaded into Supabase storage.

### 8) The result is sent back
The backend sends the final clip data to the frontend.

---

## 8. Why SSE is important

SSE stands for Server-Sent Events.

It is used so the frontend can show live progress while the backend is still running.

Without SSE, the user would have to wait with no feedback.

The backend sends events like:

- progress
- success
- error

The frontend listens for these events and updates the UI accordingly.

---

## 9. Supabase role in the project

Supabase is used in two places:

### Frontend Supabase
Used for:

- user signup/login
- authenticated session tracking
- reading project and clip data

### Backend Supabase
Used for:

- validating user tokens
- checking project ownership
- uploading video clips to storage

This means the app has both client-side and server-side Supabase integrations.

---

## 10. Database idea (projects and clips)

The app expects at least two tables:

### `projects`
Stores each job or video processing item.

Typical fields:

- id
- user_id
- title
- input_type
- input_url
- status
- created_at

### `clips`
Stores each generated clip.

Typical fields:

- id
- project_id
- clip_url
- start_time
- end_time
- reason
- created_at

This is how the app remembers what clips were generated for each project.

---

## 11. Important files to know first

If you are a new developer, these files are the best starting point:

### Frontend

- `frontend/src/App.tsx` — app routes
- `frontend/src/context/CliprolContext.tsx` — global state
- `frontend/src/pages/ProcessingPage.tsx` — main processing flow in the browser
- `frontend/src/pages/ResultsPage.tsx` — displays final clips
- `frontend/src/lib/supabase/project.ts` — project database operations
- `frontend/src/lib/supabase/clips.ts` — clip database operations

### Backend

- `backend/main.py` — app entry point
- `backend/routes/processing.py` — API routes
- `backend/services/processing_service.py` — main workflow
- `backend/detector/detector.py` — AI moment detection
- `backend/downloader/downloader.py` — download logic
- `backend/editor/editor.py` — clip generation
- `backend/services/project_service.py` — auth/project validation

These are the main files you will read again and again while working on this project.

---

## 12. What is already working

This project already has these core pieces:

- landing page UI
- login/signup screens
- project creation flow
- URL-based processing flow
- AI video analysis
- automatic clip extraction
- progress streaming
- clip display page
- Supabase integration for storage and auth

So the core MVP is present and functional.

---

## 13. What is still incomplete or limited

This project is not fully production-ready yet. A few things are intentionally simplified or left unfinished.

### 1) Upload processing is not fully implemented
The upload endpoint exists, but it does not fully support real project-backed uploads yet.

### 2) Projects page is mostly a placeholder
`DashboardProjects.tsx` has an empty state and does not load real projects yet.

### 3) Only YouTube links are supported for now
The platform validation currently only recognizes YouTube.

### 4) Google login button is present but not actually connected
This is just a UI placeholder.

### 5) The downloader has a fragile assumption
It relies on a specific structure from `yt_dlp`, so it may break if the response changes.

These are not necessarily bad; they are common MVP limitations.

---

## 14. The real processing flow, step by step

This is the most important part for understanding the app.

### Step-by-step summary

1. User logs in.
2. User creates a project.
3. The frontend sends a POST request to `/process-url`.
4. Backend validates the user token and project ownership.
5. Backend creates a temporary storage folder.
6. It downloads the video with `yt_dlp`.
7. It converts the video using `ffmpeg`.
8. It uploads the video to Gemini for analysis.
9. Gemini returns candidate moments with times and reasons.
10. Backend cuts each relevant segment with `moviepy`.
11. Each clip is uploaded to Supabase storage.
12. The frontend gets the final clip list and shows the results.

That is the full life cycle of a processing request.

---

## 15. The most important technical tools used

### React + TypeScript
Used for the full frontend experience.

### Vite
Used to run and build the frontend app.

### FastAPI
Used to expose API routes and handle HTTP requests.

### Supabase
Used for auth and storage.

### Gemini
Used to detect the best moments in a video.

### yt-dlp
Used to fetch the video from a URL.

### ffmpeg
Used to prepare the video file for editing.

### moviepy
Used to crop and export the final short clips.

---

## 16. Setup instructions

### Frontend setup

Open the `frontend` folder and run:

```bash
npm install
npm run dev
```

This starts the frontend development server.

### Backend setup

Open the `backend` folder and run:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

On Windows, activation is usually:

```bash
.venv\Scripts\activate
```

---

## 17. Environment variables you need

The app expects these values to exist in environment files:

### Frontend

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (optional if default is used)

### Backend

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Do not commit real secrets to Git.

---

## 18. Good beginner checklist

If you are new to the project, this is the best order to learn it:

1. Read `frontend/src/App.tsx`
2. Read `frontend/src/context/CliprolContext.tsx`
3. Read `frontend/src/pages/ProcessingPage.tsx`
4. Read `backend/main.py`
5. Read `backend/routes/processing.py`
6. Read `backend/services/processing_service.py`
7. Read `backend/detector/detector.py`
8. Read `backend/downloader/downloader.py`
9. Read `backend/editor/editor.py`
10. Read `frontend/src/lib/supabase/*.ts`

This sequence explains the app from top to bottom in a practical way.

---

## 19. Best way to think about this project

A simple mental model is:

- The frontend is the user-facing control panel.
- The backend is the job runner.
- Gemini is the editor that picks the best moments.
- ffmpeg and moviepy are the actual video tools.
- Supabase is the storage and auth platform.

Once you understand this model, the code becomes much easier to follow.

---

## 20. Final summary

Cliprol is a small but meaningful AI video clipping app.

It takes a long video, finds the exciting moments, cuts them into short clips, and presents them to the user.

The project is a good example of a full-stack MVP built using:

- React for the frontend
- FastAPI for the backend
- Supabase for auth and storage
- Gemini for AI analysis
- ffmpeg + moviepy for video editing

It is a strong project for a new developer because the architecture is clear, and the main processing flow is easy to follow once you know the key files.

If you are starting fresh, do not try to understand every line at once. First understand the flow:

User input -> project creation -> backend processing -> AI analysis -> clip generation -> result page

That is the heart of the app.
