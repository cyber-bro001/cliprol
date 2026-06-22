from fastapi import FastAPI, HTTPException
import uuid
import os
import asyncio
from dotenv import load_dotenv

from downloader.downloader import download_video
from editor.editor import create_clip
from editor.transcriber import transcribe_video
from detector.detector import moment_detection

load_dotenv()

BASE_STORAGE = os.getenv("STORAGE_PATH", "storage/videos")

app = FastAPI()


@app.post("/process")
async def process_video(url: str):

    try:

        job_id = str(uuid.uuid4())
        folder = f"{BASE_STORAGE}/{job_id}"
        os.makedirs(folder, exist_ok=True)

        loop = asyncio.get_event_loop()

        video =  await loop.run_in_executor(None, lambda: download_video(url, folder)) 
        print(f"[DEBUG] Video downloaded: {video}")


        json_file = await loop.run_in_executor(None, lambda: transcribe_video(video, folder))
        print(f"[DEBUG] JSON file: {json_file}")
        print(f"[DEBUG] JSON exists: {os.path.exists(json_file)}")

        moments = await loop.run_in_executor(None, lambda: moment_detection(json_file))
        print(f"[DEBUG] Moments: {moments}")
        

        clips = []

        for moment in moments:
            start_time = moment["timestamp"]
            duration = 30 #30 seconds clip

            clip = await loop.run_in_executor(
                None,
                lambda st=start_time, d=duration: create_clip(video, st, d, folder)
            )
            clips.append(clip)

        return {
            "status": "success",
            "moments_detected": len(moments),
            "clips": clips,
            "moments": moments
        }


    except Exception as e:
        print(f"[ERROR] {str(0)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))