import json
import os
from dotenv import load_dotenv
from google import genai 

load_dotenv()

GEMINI = os.getenv("GEMINI_API_KEY")


def moment_detection(video_path):
    client = genai.Client(api_key=GEMINI)
    video_file = client.files.upload(video_path)
