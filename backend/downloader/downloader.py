import yt_dlp


def download_video(url):

    options = {
        "format": "bv*[height<=720]+ba/b",
        "merge_output_format": "mp4",

        "postprocessor_args": {
            "merger": [
                "-c:v", "libx264",
                "-c:a", "aac",
                "-b:a", "192k"
            ]
        },
        "outtmpl": "storage/videos/%(title)s.%(ext)s"
    }

    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(url, download=True)

        filename = ydl.prepare_filename(info)

        return filename.replace(".webm", ".mp4")