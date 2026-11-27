from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes.processing import MAX_UPLOAD_BYTES, router as processing_route
from routes.clips import router as clips_route
from routes.projects import router as projects_route

app = FastAPI()


@app.middleware("http")
async def limit_video_upload_size(request, call_next):
    if request.method == "POST" and request.url.path == "/upload-video":
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                request_size = int(content_length)
            except ValueError:
                return JSONResponse({"detail": "Invalid Content-Length."}, status_code=400)
            if request_size > MAX_UPLOAD_BYTES:
                return JSONResponse({"detail": "Uploaded video exceeds the size limit."}, status_code=413)
    return await call_next(request)

origins = [
    "http://localhost:5173",
    "http://192.168.93.241:5173",
    "http://192.168.0.99:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(processing_route)
app.include_router(clips_route)
app.include_router(projects_route)
