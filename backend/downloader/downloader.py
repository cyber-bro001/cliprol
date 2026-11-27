import yt_dlp


def download_video(url, folder):

    options = {
        "format": "bv*[height<=720]+ba/b",
        "merge_output_format": "mp4",
        "outtmpl": f"{folder}/raw.%(ext)s",
        # Large YouTube downloads can run for hours. Retry transient CDN
        # failures and allow a stalled connection more time before giving up.
        "socket_timeout": 60,
        "retries": 10,
        "fragment_retries": 10,
        "extractor_retries": 3,
        "file_access_retries": 3,
        "noplaylist": True,
    }

    with yt_dlp.YoutubeDL(options) as ydl:
       info = ydl.extract_info(url, download=True)

       # yt-dlp already merges separate streams when needed. Keep that output
       # as the source: the clip encoder will create the final H.264/AAC files,
       # so re-encoding the entire source here only adds another costly pass.
       source_file = info.get("filepath")
       if not source_file:
           downloads = info.get("requested_downloads") or []
           source_file = downloads[0].get("filepath") if downloads else None
       if not source_file:
           raise RuntimeError("yt-dlp did not return the downloaded video path")

       return source_file, info.get("title")
