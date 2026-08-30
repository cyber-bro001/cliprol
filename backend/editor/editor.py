from moviepy import VideoFileClip
import os


def create_clip(video_path, start_time, end_time, folder):
    """
    Extract a clip from a video.

    Clamps start/end to the source video's actual duration and skips
    invalid ranges (start >= end or start >= duration) so an empty clip
    is never written.

    Args:
        video_path: Path to the video file
        start_time: Start time in seconds
        end_time: End time in seconds
        folder: Output folder

    Returns:
        Path to the created clip, or None if the range is invalid
    """

    video = VideoFileClip(video_path)
    duration = video.duration

    safe_start = max(0.0, float(start_time))
    safe_end = min(duration, float(end_time))

    if safe_end <= safe_start or safe_start >= duration:
        video.close()
        return None

    clip = video.subclipped(safe_start, safe_end)

    output = f"{folder}/clip_{int(safe_start)}.mp4"

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
