import json
import os
from dotenv import load_dotenv
from google import genai 
import time

load_dotenv()

GEMINI = os.getenv("GEMINI_API_KEY")


def moment_detection(video_path):
    client = genai.Client(api_key=GEMINI)

    print("1. Client created")

    video_file = client.files.upload(file=video_path)

    print("2. upload complete")

    while video_file.state.name == "PROCESSING":
        print("3. Processing...")
        time.sleep(5)
        video_file = client.files.get(name=video_file.name)

    #remeber to remove this
    print(f"DEBUG_VIDEO_FILE: {video_file}")

    prompt = """
You are an expert short-form video editor.

Analyze this video and identify the most interesting moments
that should become short clips for social media.

Look for:
- important moments
- emotional reactions
- funny moments
- surprising moments
- strong opinions
- valuable explanations
- moments that would make someone stop scrolling

For each moment return:

- start time in seconds
- end time in seconds
- why this moment is interesting

Rules:
- Do not include boring introductions
- Do not include greetings
- Do not include dead space
- Keep clips between 30 and 60 seconds
- Choose only the strongest moments

Return ONLY valid JSON.

Format:

[
  {
    "start": 120,
    "end": 155,
    "reason": "The speaker explains a surprising idea"
  }
]
"""
     
    print("4. Processing finished")

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            video_file,
            prompt
        ]
    )

    print("5. Response recieved")

    #remeber to remove this
    print(f"DEBUG_RESPONSE: {response}")

    result = response.text

    refined_result = result.replace("```json", "").replace("```", "").strip()
    #remeber to remove this
    print(f"DEBUG_RESULT: {refined_result}")

    return json.loads(refined_result)