import json

def sse_helper(event: str, data:dict):
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"