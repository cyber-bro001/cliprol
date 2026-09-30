from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.processing import router as processing_route
from routes.clips import router as clips_route
from routes.projects import router as projects_route

app = FastAPI()

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
