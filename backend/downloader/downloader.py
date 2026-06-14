import yt_dlp

print(yt_dlp.utils.check_executable("ffmpeg"))


def dowload_video(url):
    options = {
        "format": "bv*+ba/b",
        "merge_output_format": "mp4",
        "outtmpl": "storage/videos/%(title)s.%(ext)s"
    }

    with yt_dlp.YoutubeDL(options) as ydl:
        info = ydl.extract_info(url, download=True)

        filename = ydl.prepare_filename(info)

        return filename.replace(".webm", ".mp4")