from moviepy import VideoFileClip
import math


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
        (path, actual_start, actual_end), or None if the range is invalid.
        Boundaries are whole seconds to match the existing clips table.
    """

    video = VideoFileClip(video_path)
    clip = None
    try:
        duration = video.duration
        safe_start = math.ceil(max(0.0, float(start_time)))
        safe_end = math.floor(min(duration, float(end_time)))
        if safe_end <= safe_start or safe_start >= duration:
            return None
        clip = video.subclipped(safe_start, safe_end)
        output = f"{folder}/clip_{int(safe_start)}.mp4"
        clip.write_videofile(
            output,
            codec="libx264",
            audio_codec="aac"
        )
    finally:
        try:
            if clip is not None:
                clip.close()
        finally:
            video.close()

    return output, safe_start, safe_end
