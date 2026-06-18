from fastapi import FastAPI, HTTPException
import uuid
import os
import asyncio

from downloader.downloader import download_video
from editor.editor import create_clip

app = FastAPI()


@app.post("/process")
async def process_video(url: str):

    try:

        job_id = str(uuid.uuid4())
        folder = f"storage/videos/{job_id}"
        os.makedirs(folder, exist_ok=True)

        loop = asyncio.get_event_loop()

        video =  await loop.run_in_executor(None, lambda: download_video(url, folder)) 

        clip = await loop.run_in_executor(None, lambda: create_clip(video, 30, folder))


        return {
            "status": "success",
            "original": video,
            "clip": clip
        }


    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))