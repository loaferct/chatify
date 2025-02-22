from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.friend import router as friend_router
from routers.message import router as message_router
from routers.story import router as story_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(friend_router, prefix="/friends", tags=["friends"])
app.include_router(message_router, prefix="/message", tags=["message"])
app.include_router(story_router, prefix="/stories", tags=["stories"])

@app.get("/")
async def root():
    return {"message": "Welcome to the chat app API!"}
