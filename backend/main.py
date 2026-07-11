from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uuid
import os
import asyncio
from dotenv import load_dotenv

from downloader.downloader import download_video
from editor.editor import create_clip
from detector.detector import moment_detection

load_dotenv()

BASE_STORAGE = os.getenv("STORAGE_PATH", "storage/videos")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def process_pipeline(video, folder):
    try:
        loop = asyncio.get_event_loop()

        moments = await loop.run_in_executor(None, lambda: moment_detection(video))
        print(f"[DEBUG] Moments: {moments}")

        if not moments:
            os.remove(video)
            return {
                "status": "success",
                "moments_detected": 0,
                "clips": [],
                "message": "No moments detected"
            }

        clips = []

        for moment in moments:
            start_time = moment["start"]
            end_time = moment["end"]

            clip = await loop.run_in_executor(
                None,
                lambda st=start_time, ed=end_time: create_clip(video, st, ed, folder)
            )
            clips.append(clip)

        os.remove(video)

        return {
            "status": "success",
            "moments_detected": len(moments),
            "clips": clips,
            "moments": moments
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process-url")
async def process_video(url: str):
    try:
        job_id = str(uuid.uuid4())
        folder = f"{BASE_STORAGE}/{job_id}"
        os.makedirs(folder, exist_ok=True)

        loop = asyncio.get_event_loop()

        video = await loop.run_in_executor(None, lambda: download_video(url, folder))
        print(f"[DEBUG] Video downloaded: {video}")

        return await process_pipeline(video, folder)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-video")
async def process_upload(file: UploadFile = File(...)):
    try:
        job_id = str(uuid.uuid4())
        folder = f"{BASE_STORAGE}/{job_id}"
        os.makedirs(folder, exist_ok=True)

        video_path = f"{folder}/final.mp4"

        contents = await file.read()

        with open(video_path, "wb") as f:
            f.write(contents)

        return await process_pipeline(video_path, folder)

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))