from fastapi import FastAPI
import uuid
import os

from downloader.downloader import download_video
from editor.editor import create_clip

app = FastAPI()


@app.post("/process")
def process_video(url: str):

    try:

        job_id = str(uuid.uuid4())

        folder = f"storage/videos/{job_id}"

        os.makedirs(folder, exist_ok=True)


        video = download_video(url, folder)

        clip = create_clip(video, 30, folder)


        return {
            "status": "success",
            "original": video,
            "clip": clip
        }


    except Exception as e:

        return {
            "status": "failed",
            "error": str(e)
        }