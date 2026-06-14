from fastapi import FastAPI
from downloader.downloader import dowload_video
from editor.editor import create_clip

app = FastAPI()


@app.post("/process")
def process_video(url: str):
    
    video = dowload_video(url)

    clip = create_clip(video)

    return{
        "original": video,
        "clip": clip
    }