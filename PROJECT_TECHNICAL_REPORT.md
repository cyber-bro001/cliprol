# Cliprol Project Guide (Beginner Friendly)

This is a simple guide for anyone starting on this project. The goal is to help a new developer understand what the app does, how it works, and where to start.

Product direction is defined in [Cliprol_Product_Vision.md](Cliprol_Product_Vision.md), revised 2026-10-06. Cliprol is a creator-facing content repurposing platform, with intelligent clipping as its current core capability. Broader formatting and distribution capabilities are direction, not implemented features.

Checkout audit (2026-10-06): the media milestone records historical test results, but its referenced tests, verification script, and migration are absent from this checkout. No landing/input test files or test script were found; Vitest, Testing Library, and jsdom are declared dependencies. Historical verification is not proof of this checkout's deployment state.

## 1. What this project is

Cliprol is a web app that takes a long video and finds the best short moments in it.

Example flow:

1. A user pastes a YouTube link or uploads a video.
2. The backend downloads or reads the video.
3. AI looks through the video and finds moments that feel interesting.
4. The app cuts those moments into short clips.
5. The clips are stored in cloud storage.
6. The frontend shows the clips to the user.

The current implementation focuses on intelligent clipping within the broader content repurposing direction.

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
- why this moment is interesting4

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

So the core MVP is present and functionality


## 13. What is still incomplete or limited

This project is not fully production-ready yet. A few things are intentionally simplified or left unfinished.

### 1) Upload authentication handoff needs attention
Project-backed upload processing exists in `/upload-video`. The selected file stays in React context and is lost on reload. Landing URL submissions persist a pending URL and resume at New Project after login; upload submissions do not record equivalent navigation intent, so login normally falls back to Projects. A focused handoff fix should accompany later input work.

### 2) Project history depends on deployed media infrastructure
`DashboardProjects.tsx` loads completed projects, thumbnail access, and deletion controls. Deployment requirements and historical verification are described in `PROJECT_MEDIA_MILESTONE.md`; referenced migration/checker artifacts are missing here.

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

Cliprol is a content repurposing platform for creators whose current core implementation is intelligent clipping.

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

## 21. Hero implementation (2026-10-09)

The approved scope is Header + Hero + functional input + HeroTransformation. Lower-page composition is deferred; existing lower components were not redesigned or restored in this pass. Existing auth, project creation, processing, dashboard, persisted results, and backend files were not changed in this pass. Earlier working-tree changes are separate from this hero iteration.

### Component ownership

- App retains route/header ownership. Header uses the independently replaceable temporary LogoMark, How it works / Use cases / FAQ anchors, session-aware Sign in / Dashboard, and Get started.
- LandingPage composes Hero, the real InputSection, and HeroTransformation inside the same hero section. It does not own animation or processing state.
- Hero uses the approved headline/subhead with neutral typography and no marketing eyebrow.
- InputSection retains existing shared validation, URL/upload selection, navigation, and onProcess delegation. This pass refines its existing CSS without changing its behavior or authentication helpers.
- HeroTransformation owns the unframed spatial demonstration. It has automatic cycling and one pause/resume control, with no visible scenario selector, stage headings, caption grid, or capability note. A screen-reader description explains the visual example without repeated live announcements.
- SourcePreview retains one source image element per scenario through every phase; its transform changes the source into the landscape result. It owns the attached MomentTimeline.
- MomentTimeline displays two illustrative normalized moment positions. No invented source duration, timestamps, percentage progress, or actual-analysis claims are rendered.
- OutputFan renders only the two portrait images, each linked to a moment ID. It does not duplicate the landscape source.
- ScenarioMedia owns intrinsic dimensions, loading priority, accessible descriptions, and a truthful unavailable-image fallback. The supplied assets are stills, so no marketing video playback controls are created.
- useHeroSequence owns phases, remaining-time pause/resume, viewport/tab visibility, reduced motion, and media preparation. CSS handles transforms/opacity; React is not updated every frame.
- heroScenarios.ts contains exactly Gaming, Podcast, and Coaching in that order. Each has one original and two portrait clips. game-clip3.png remains unused by owner instruction; game-original.png retains its baked-in player controls by owner instruction.

### Timing and rendering

| Time | Phase |
| --- | --- |
| 0?0.3 s | Source settles immediately |
| 0.3?1.0 s | Two timeline markers appear sequentially |
| 1.0?2.4 s | Portraits emerge; persistent source moves to landscape-result position |
| 2.4?5.4 s | Completed result holds |
| 5.4?6.1 s | Composition exits, then the next source enters |

The loop is 6.1 seconds per scenario. CSS event timing comes from heroTiming, derived from the same phase durations as the hook. Pause/visibility changes preserve remaining phase time and pause CSS animations. Images are prepared before timing starts; image failure permits a fallback rather than stalling the cycle. The next scenario is prepared during the result hold, rather than loading all nine images on entry.

Desktop places portraits around the landscape source. Tablet adjusts sizes/travel. Mobile places the persistent landscape above the two portraits and uses matching origin positions. Reduced motion renders the full result, retains a static moment timeline, and disables cycling and the unnecessary pause control. Stage dimensions reserve space throughout the loop.

### Media

Supplied PNGs remain untouched in frontend/src/assets/reference. Nine WebP derivatives preserve the full dimensions and framing under frontend/public/media/landing/{gaming,podcast,coaching}/{source,clip-1,clip-2}.webp. Total derivative size is 883,680 bytes, versus 17,458,197 bytes for the nine selected originals. The Opus screen recording and unused game-clip3.png are not imported or served as marketing assets. Replacement mapping/dimensions are documented in frontend/public/media/landing/README.md.

### Validation actually executed

- 24 focused tests passed across four test files: input behavior, auth destination/upload intent, animation timing/DOM continuity, pause/resume, visibility, reduced motion, preparation order, and media fallback.
- Type checking passed. Production build passed, with the existing application bundle warning above 500 kB.
- Scoped lint passed for hero/header/input/composition and tests. Full-project lint still has the pre-existing react-refresh/only-export-components issue in CliprolContext.tsx; this pass does not refactor that context.
- Built-site headless Edge checks passed at 1440?900, 1280?800, 820?1180, 390?844, and 320?740: all result images fit in the first viewport, no horizontal overflow, neutral headline, no stage frame, and completed reduced-motion presentation.
- Edge verified source node identity, completion by 2.4 seconds, pause/resume, Gaming ? Podcast ? Coaching cycling, keyboard menu dismissal, and Get started input focus. No runtime exceptions were observed. Screenshots, including hidden-copy examples, are in frontend/node_modules/.cache/landing-review.
- Live backend processing and real-account authentication were not exercised; shared input behavior was verified with focused tests. Historical milestone test counts are not reported as this checkout's validation.

### Files changed in this hero iteration

- frontend/src/components/landing/HeroTransformation.tsx
- frontend/src/components/landing/SourcePreview.tsx
- frontend/src/components/landing/MomentTimeline.tsx
- frontend/src/components/landing/OutputFan.tsx
- frontend/src/components/landing/ScenarioMedia.tsx
- frontend/src/components/landing/useHeroSequence.ts
- frontend/src/components/landing/heroScenarios.ts
- frontend/src/pages/LandingPage.tsx
- frontend/src/index.css
- frontend/tests/hero-transformation.test.tsx
- frontend/tests/marketing-media.test.tsx
- frontend/scripts/verify-landing.mjs
- frontend/public/media/landing/README.md
- Cliprol_Product_Vision.md
- PROJECT_TECHNICAL_REPORT.md

Created media files: frontend/public/media/landing/gaming/source.webp, gaming/clip-1.webp, gaming/clip-2.webp; frontend/public/media/landing/podcast/source.webp, podcast/clip-1.webp, podcast/clip-2.webp; frontend/public/media/landing/coaching/source.webp, coaching/clip-1.webp, coaching/clip-2.webp. Paths abbreviated after each scenario share its preceding directory.

Header.tsx, Hero.tsx, LogoMark.tsx, and InputSection.tsx markup from earlier approved work was retained; this iteration refined their presentation through index.css. No placeholder scenario assets remain. The isolated LogoMark remains a temporary brand mark.

Stop at this hero pass for owner browser review. No deployment or lower-page redesign is included.

## 22. Moment showcase (2026-10-09)

WhyCliprol now renders an automatic image-and-reason composition instead of the previous heading, marketing paragraphs, and feature cards. momentExamples.ts owns the asset descriptions and illustrative reasons. ScenarioMedia is reused for intrinsic dimensions, lazy loading, and the unavailable-image fallback; the hero sequence and functional flows are unchanged.

The owner corrected the initial third-asset mapping: the final loop is Gaming (game-clip1.png / Double Kill), female podcaster (lady-podcast.png), male podcast reaction (guy-react.png). The standing coach is excluded from this section. Each image was visually inspected. Reasons reference visible action/gestures and are explicitly labeled illustrative; no transcript or actual detector output is implied.

Each pair holds for 5 seconds, fades out together for 200 ms, and is replaced atomically by the next pair with a 200 ms entrance included in the next hold. One timer drives both image and reason. Remaining time and CSS animation playback are preserved while manually paused, offscreen, or in a hidden tab. A discreet three-segment indicator and accessible pause/resume button accompany the cycle. Reduced motion presents all three image/reason pairs statically without automatic cycling or a redundant pause button. Desktop pairs the portrait and reason horizontally; mobile stacks them.

New WebP derivatives preserve full 941 x 1672 framing using FFmpeg libwebp quality 84: lady-podcast.webp (72,758 bytes) and guy-react.webp (66,064 bytes). Originals remain untouched. Gaming reuses the existing production derivative. No placeholder assets are used.

Files changed in this pass: frontend/src/components/WhyCliprol.tsx, frontend/src/components/landing/momentExamples.ts (new), frontend/src/index.css, frontend/tests/moment-showcase.test.tsx (new), frontend/public/media/landing/showcase/lady-podcast.webp (new), frontend/public/media/landing/showcase/guy-react.webp (new), and PROJECT_TECHNICAL_REPORT.md.

Validation: 27 tests passed across five files, including three new showcase tests for paired sequencing, remaining-time pause/offscreen behavior, and reduced motion. Type checking, production build, and scoped lint passed. The existing application bundle warning above 500 kB remains. Browser visual review of this section is pending; the prior hero browser checks are not claimed as validation of this new section. Stop for owner visual review.

## 23. Remaining landing-page sections (2026-10-09)

The old three-step HowItWorks layout, placeholder previews, and explanatory cards were removed. HowItWorks retains its composition responsibility but now mounts #ready-to-share: one existing female podcast clip remains the same image as a generic mobile shell emerges around it. The one-shot 3.8-second transformation pauses offscreen or in a hidden tab and settles permanently; reduced motion shows the completed context immediately. There is no audio, platform branding, account, engagement data, or publishing action. The phone frame is a marketing illustration of viewing downloaded content, not an implemented distribution integration.

FAQ retains single-item accordion behavior with only the four adoption questions. Answers describe account requirements, device uploads/YouTube links, local-file reselection after reload, variable processing time, and reviewing suggested clips. Buttons now expose expanded state and answer relationships. Introductory paragraphs were removed.

FinalCTA appears immediately before Footer and uses the requested headline and Get Clips action. The action focuses and scrolls to the existing InputSection; it does not submit, process, authenticate, or persist anything independently. Header shares this focus helper and still hides Get started for signed-in users. Header and Footer share navigation anchors to Moments, Ready to share, and FAQ, with home-route prefixes from other pages. Footer retains the Cliprol mark and functional navigation without fabricated legal/social destinations or open-source claims.

Hero and Moment Showcase runtime behavior and media were unchanged. No backend, pipeline, database, dashboard, auth helper, or input-processing code was changed. CSS additions are scoped to the new/revised sections and use centralized colors, radii, spacing, easing, and shadows.

Files changed in this pass:
- frontend/src/components/HowItWorks.tsx
- frontend/src/components/FAQ.tsx
- frontend/src/components/Footer.tsx
- frontend/src/components/Header.tsx
- frontend/src/components/FinalCTA.tsx (new)
- frontend/src/components/landing/landingNavigation.ts (new)
- frontend/src/pages/LandingPage.tsx
- frontend/src/index.css
- frontend/tests/landing-completion.test.tsx (new)
- frontend/scripts/verify-landing.mjs
- PROJECT_TECHNICAL_REPORT.md

Actual validation: 31 tests passed across six files; production build and TypeScript passed. Scoped lint for changed runtime files and new tests passed. Full-project lint failed only on the existing react-refresh/only-export-components error at CliprolContext.tsx:82; that unrelated context was not refactored. The application JS bundle is 505.47 kB, retaining the build warning above 500 kB.

Headless Edge exercised the built site: the source image remains the same node while the completed mobile shell emerges; heading-hidden screenshots show the viewing context without explanatory copy; reduced-motion CSS has no animation; desktop (1440), tablet (820), mobile (390), and small mobile (320) have no horizontal overflow. FAQ disclosure, all header/footer anchor targets, final CTA placement, and shared-input focus passed. Existing hero regressions also passed at five viewport sizes. No runtime exceptions were observed. Screenshots are local under frontend/node_modules/.cache/landing-review, including ready-copy-hidden, ready-{desktop,tablet,mobile,small-mobile}, and final-{desktop,tablet,mobile,small-mobile}. Representative captures were visually inspected.

Limitations: no real-account login or live backend processing was exercised. Tests verify the shared signed-in/signed-out routes and pending URL handoff. Supplied images are still assets; the mobile illustration does not play video or publish it. No new assets or placeholders were introduced. Stop for owner visual review; no deployment is included.

## 24. Landing-page motion refinements

Moment Showcase keeps its existing active clip/reason composition. The actual next asset appears partially behind the main portrait, shadowed and subdued. A 600 ms transition slides/fades the current portrait out while the preview moves into place; the outgoing reason fades with its clip and the next reason is committed with the next active clip. The existing progress and pause controls remain, and a labeled native Next moment button initiates advancement without waiting for the five-second hold. A synchronous transition lock prevents rapid clicks from overlapping. Manual Next while paused completes one transition and retains the paused setting. Small-screen preview overflow is clipped within the section rather than shrinking the main image.

Ready-to-share now keeps all three distinct existing assets mounted in generic viewing shells. The center is dominant; the side clips are scaled and dimmed. After a five-second hold, a 600 ms transform/opacity sequence moves right to center, center to left, and the left clip behind the composition to the right. An accessible pause button controls this automatic rotation. No publishing or engagement features were added.

useClipRotation owns both sections' timer, transition lock, remaining-time pause/resume, viewport/tab visibility, and reduced motion. CSS durations use the exported transition duration. Reduced motion shows all three showcase pairs statically and a static three-clip viewing composition without redundant automatic-playback controls. useSectionEntrances owns one gentle entrance per non-hero section; header entrance and button hover/focus refinements are CSS only. The hero sequence and functional input behavior remain unchanged. No animation dependency or new media asset was introduced.

Files changed: frontend/src/components/WhyCliprol.tsx; frontend/src/components/HowItWorks.tsx; frontend/src/components/landing/useClipRotation.ts (new); frontend/src/components/landing/useSectionEntrances.ts (new); frontend/src/pages/LandingPage.tsx; frontend/src/index.css; frontend/tests/moment-showcase.test.tsx; frontend/scripts/verify-landing.mjs; PROJECT_TECHNICAL_REPORT.md.

Actual checks: 36 tests passed across six files. TypeScript, production build, and scoped lint passed. Focused tests cover preview asset identity, rapid advancement, clip/reason pairing, manual Next while paused, pausing midway through a transition, three persistent ready-to-share images, offscreen/tab visibility, and reduced motion. The build retains the application bundle warning at 507.13 kB. The previously reported full-project lint error in CliprolContext.tsx remains outside this scope.

Headless Edge checked actual upcoming-media advancement under rapid clicks, matching podcast reason, center rotation, persistent ready-to-share image elements, completed viewing shells, reduced motion, existing FAQ/input/navigation regressions, and desktop/tablet/mobile/small-mobile layouts. Representative desktop/mobile screenshots were inspected; the final small-mobile preview check uses document clientWidth to account for the scrollbar. No runtime exceptions were observed. Captures are under frontend/node_modules/.cache/landing-review. No real-account authentication or live backend processing was performed. Stop for visual review.
