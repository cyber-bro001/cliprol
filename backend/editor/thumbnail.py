"""One source frame, no additional media service or model call."""
import math
from pathlib import Path

from moviepy import VideoFileClip
from PIL import Image, ImageOps


def create_thumbnail(video_path: str, folder: str) -> str:
    destination = str(Path(folder) / 'thumbnail.jpg')
    with VideoFileClip(video_path, audio=False) as video:
        duration = float(video.duration)
        if not math.isfinite(duration) or duration <= 0:
            raise ValueError('Source has no usable duration')
        timestamp = min(5.0, duration * 0.1, max(0.0, duration - 0.001))
        with Image.fromarray(video.get_frame(timestamp)).convert('RGB') as frame:
            # A real frame letterboxed to 16:9; never distort portrait sources.
            with ImageOps.pad(frame, (640, 360), method=Image.Resampling.LANCZOS, color='black') as thumbnail:
                thumbnail.save(destination, format='JPEG', quality=80)
    return destination
