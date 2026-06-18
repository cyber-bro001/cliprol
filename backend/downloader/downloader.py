import yt_dlp
import subprocess
import os


def download_video(url, folder):

    options = {
        "format": "bv*[height<=720]+ba/b",
        "merge_output_format": "webm",
        "outtmpl": f"{folder}/raw.%(ext)s"
    }

    with yt_dlp.YoutubeDL(options) as ydl:
       ydl.download([url])

       input_file = f"{folder}/raw.webm"
       output_file = f"{folder}/final.mp4"

    subprocess.run([
       "ffmpeg",
       "-i",
       input_file,
       
       "-c:v",
       "libx264",
       
       "-c:a",
       "aac",
       
       "-b:a",
       "192k",
       
       output_file,
       "-y"
       ])
    
    os.remove(input_file)
    
    return output_file