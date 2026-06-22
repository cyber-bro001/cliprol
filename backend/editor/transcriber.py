import subprocess
import json
import os


def transcribe_video(video_path, output_folder):
     """
    Transcribe video using Whisper.
    
    Args:
        video_path: Path to the video file
        output_folder: Where to save the JSON output
    
    Returns:
        Path to the JSON file with transcription
    """
     
     subprocess.run([
          "whisper",
          video_path,
          "--output_format", "json",
          "--output_dir", output_folder
     ], check=True)

     for file in os.listdir(output_folder):
          if file.endswith(".json"):
               json_file = os.path.join(output_folder, file)

               return json_file
    
     raise FileNotFoundError("Whisper JSON not created.")