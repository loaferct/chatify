from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
import os
import shutil
import logging
from fastapi.responses import FileResponse
from database import get_db
from datetime import datetime, timedelta
from routers.auth import get_current_user

router = APIRouter()

# Maximum story duration (24 hours)
MAX_STORY_DURATION = timedelta(hours=1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

## Helper function to delete expired stories (older than 23 hours)
def delete_expired_stories(db):
    cursor = db.cursor()
    
    # Fetch the stories that are older than 23 hours
    cursor.execute("SELECT id, story_picture FROM stories WHERE created_at < %s", 
                   (datetime.utcnow() - timedelta(hours=MAX_STORY_DURATION),))
    expired_stories = cursor.fetchall()

    for story in expired_stories:
        # Get the file path of the story
        story_image_path = story[1]
        
        # Delete the story file from the server (filesystem)
        if os.path.isfile(story_image_path):
            try:
                os.remove(story_image_path)
            except Exception as e:
                # Log the error if file removal fails
                logger.error(f"Failed to delete file {story_image_path}: {e}")
        
        # Delete the expired story record from the database
        cursor.execute("DELETE FROM stories WHERE id = %s", (story[0],))
    
    db.commit()
    cursor.close()


# Endpoint to upload a story
@router.post("/upload_story")
async def upload_story(story_file: UploadFile = File(...), db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]
    
    # Check if the user already has a story uploaded
    cursor.execute("SELECT id FROM stories WHERE username = %s AND created_at > %s", 
                   (username, datetime.utcnow() - MAX_STORY_DURATION))
    existing_story = cursor.fetchone()
    if existing_story:
        cursor.close()
        raise HTTPException(status_code=400, detail="You can only upload one story within 24 hours.")

    # Save the story image (simplified example)
    story_image_path = f"stories/{username}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}.jpg"
    try:
        # Save the uploaded file to the server
        with open(story_image_path, "wb") as buffer:
            shutil.copyfileobj(story_file.file, buffer)
    except Exception as e:
        cursor.close()
        raise HTTPException(status_code=500, detail="Failed to upload story image.")

    # Insert the story record into the database (save in the story_picture column)
    cursor.execute(
        "INSERT INTO stories (username, story_picture, created_at) VALUES (%s, %s, %s)",
        (username, story_image_path, datetime.utcnow())
    )
    db.commit()
    cursor.close()

    return {"message": "Story uploaded successfully."}


## Endpoint to get all friends' stories
@router.get("/friends_stories")
async def get_friends_stories(db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    # Get the current user's friends and their stories
    cursor.execute("""
        SELECT u.username, s.story_picture, s.created_at
        FROM friends f
        JOIN users u ON (f.user_id = u.id OR f.friend_id = u.id)
        LEFT JOIN stories s ON u.username = s.username
        WHERE (f.user_id = (SELECT id FROM users WHERE username = %s) 
               OR f.friend_id = (SELECT id FROM users WHERE username = %s))
        AND u.username != %s
        AND s.created_at > %s
    """, (username, username, username, datetime.utcnow() - MAX_STORY_DURATION))

    stories = cursor.fetchall()
    cursor.close()

    # Use a dictionary to filter out duplicate usernames (keep only the first story for each user)
    unique_stories = {}
    for story in stories:
        if story[0] not in unique_stories:
            unique_stories[story[0]] = {"friend_username": story[0], "story_picture": story[1], "created_at": story[2]}

    # Return the stories as a list
    return list(unique_stories.values())

STORY_DIRECTORY = "stories"

@router.get("/story/{filename}")
async def get_story_image(filename: str):
    file_path = os.path.join(STORY_DIRECTORY, filename)
    
    # Check if the file exists
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Story not found.")
    
    return FileResponse(file_path)
