# Backend setup

## System requirements

Install these prerequisites and make them available on your `PATH`:

- Python
- FFmpeg
- Deno (verified working with version 2.9.7)

Deno is required by yt-dlp for YouTube JavaScript challenge support. It is a
system dependency and must be installed separately, not through `requirements.txt`.

## Python dependencies

With your Python virtual environment activated, run from the repository root:

```sh
python -m pip install -r backend/requirements.txt
```

The requirements pin `yt-dlp[default]==2026.8.19`, including yt-dlp's default
dependencies. The verified working setup used yt-dlp-ejs 0.8.0.

## Verify installation

Run these commands in the same environment used to start the backend:

```sh
deno --version
ffmpeg -version
yt-dlp --version
```

The yt-dlp version should be `2026.8.19`. Direct YouTube downloads and full
Cliprol YouTube URL processing have been verified with this setup.
