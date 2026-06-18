from moviepy import VideoFileClip


def create_clip(video_path, duration, folder):

    video = VideoFileClip(video_path)

    end = min(video.duration, duration)

    clip = video.subclipped(0, end)

    output = f"{folder}/clip.mp4"

    try:
        clip.write_videofile(
        output,
        codec="libx264",
        audio_codec="aac"
    )

    finally:
         video.close()
         clip.close()
         
    return output