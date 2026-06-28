from moviepy import VideoFileClip
import os


def create_clip(video_path, start_time, end_time, folder):
    """
    Extract a clip from a video starting at start_time.
    
    Args:
        video_path: Path to the video file
        start_time: Start time in seconds
        duration: Clip duration in seconds
        folder: Output folder
    
    Returns:
        Path to the created clip
    """

    video = VideoFileClip(video_path)

    final_end_time = min(video.duration, end_time)

    clip = video.subclipped(start_time, final_end_time)

    output = f"{folder}/clip_{int(start_time)}.mp4"

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