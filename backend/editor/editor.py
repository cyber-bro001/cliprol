from moviepy import VideoFileClip


def create_clip(video_path):

    video = VideoFileClip(video_path)

    end = min(video.duration, 30)

    clip = video.subclipped(0, end)

    output = "storage/videos/clip.mp4"

    clip.write_videofile(
        output,
        codec="libx264",
        audio_codec="aac"
    )

    video.close()
    clip.close()

    return output