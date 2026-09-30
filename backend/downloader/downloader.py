import yt_dlp
import subprocess
import os


def download_video(url, folder):

    options = {
        "format": "bv*[height<=720]+ba/b",
        "merge_output_format": "mp4",
        "outtmpl": f"{folder}/raw.%(ext)s"
    }

    with yt_dlp.YoutubeDL(options) as ydl:
       info = ydl.extract_info(url, download=True)

       input_file = info["requested_downloads"][0]["filepath"]

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
       
       "-y",
       output_file
       ], check=True)
    
       os.remove(input_file)
    
       return output_file, info.get("title")
