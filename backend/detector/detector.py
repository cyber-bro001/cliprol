import json

GOAL_KEYWORDS = [
    "goal", "scores", "goooal", "it's in", "back of the net",
    "he scores", "she scores", "penalty", "finish",
    "header", "finish", "volley"  # ADD THESE
]

NEAR_MISS_KEYWORDS = [
    "close", "so close", "almost", "nearly", "just wide",
    "just over", "just missed"
]

SAVE_KEYWORDS = [
    "save", "great save", "what a save", "incredible save",
    "brilliant save", "denied", "parried", "keeper"
]

SKILL_KEYWORDS = [
    "skill", "dribble", "bicycle kick", "volley",
    "overhead", "brilliant", "fantastic", "incredible",
    "wonderful", "amazing", "what a", "sensational"
]

DEFENSE_KEYWORDS = [
    "tackle", "block", "challenge", "clearance", "defense"
]

EXCITEMENT_KEYWORDS = [
    "ohhh", "ohh", "wow", "yes", "beautiful", "stunning"
]


def moment_detection(json_file_path):
    """
    Detects key moment in football match by comparing the above samples of key moments with the transcription from gotten from whisper.

    Args:
        json_file_path: Path to Whisper output JSON file
    
    Returns:
        List of moments with timestamp, keyword, and keyword_type
    """

    #Read all JSON file
    with open(json_file_path, "r") as file:
        whisper_data = json.load(file)

    #Extract all segements
    segments = whisper_data.get("segments", [])

    #Store found moments
    moments = []

    #Search through each segment to find keywords
    for segment in segments:
        text = segment.get("text", "").lower()
        timestamp = segment.get("start", 0)


        #check for each keyword category
        for keyword in GOAL_KEYWORDS:
            if keyword.lower() in text:
                moments.append({
                    "timestamp": timestamp,
                    "keyword": keyword,
                    "keyword_type": "SKILL_KEYWORDS",
                    "keyword_type": "NEAR_MISS_KEYWORDS"
                })
                break
    return moments