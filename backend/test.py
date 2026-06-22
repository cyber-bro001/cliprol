import os
from editor.editor import create_clip

job_id = "7091c40e-5d70-488a-98fb-1bbd74561c34"
folder = f"storage/videos/{job_id}"
video_path = f"{folder}/final.mp4"

# Check if video exists
print(f"Video exists: {os.path.exists(video_path)}")
print(f"Video path: {video_path}")

# Try to create a clip
try:
    moment = {'timestamp': 55.0, 'keyword': 'goal'}
    clip = create_clip(video_path, moment['timestamp'], 30, folder)
    print(f"✓ Clip created: {clip}")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()