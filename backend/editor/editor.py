from moviepy import VideoFileClip

def create_clip(video_path):

    video = VideoFileClip(video_path)

    clip = video.subclipped(
        0,
        30
    )

    output = "storage/videos/clip.mp4"

    clip.write_videofile(output)

    video.close()
    video.close()

    return output