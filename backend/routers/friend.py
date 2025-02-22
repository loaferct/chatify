from fastapi import APIRouter, HTTPException, Depends
from database import get_db
from model.friend import FriendResponse
from routers.auth import get_current_user
import datetime

router = APIRouter()

@router.post("/add_friend/{friend_username}")
async def add_friend(friend_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    # Get current user details
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    # Get the friend's details
    cursor.execute("SELECT id FROM users WHERE username = %s", (friend_username,))
    friend = cursor.fetchone()
    if not friend:
        cursor.close()
        raise HTTPException(status_code=404, detail="Friend not found")
    friend_id = friend[0]

    # Check if user is trying to add themselves
    if user_id == friend_id:
        cursor.close()
        raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")

    # Check if there is already a pending friend request from the current user to the friend
    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'pending'", (user_id, friend_id))
    existing_request_from_user = cursor.fetchone()

    if existing_request_from_user:
        cursor.close()
        raise HTTPException(status_code=400, detail="Friend request already sent to this user")

    # Check if there is already a pending friend request from the friend to the current user
    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'pending'", (friend_id, user_id))
    existing_request_from_friend = cursor.fetchone()

    if existing_request_from_friend:
        cursor.close()
        raise HTTPException(status_code=400, detail="There is a pending friend request from this user")

    # Create a new friend request
    cursor.execute(
        "INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (%s, %s, %s, %s)",
        (user_id, friend_id, "pending", datetime.datetime.utcnow())
    )
    db.commit()
    cursor.close()

    return {"message": f"Friend request sent to {friend_username} successfully"}

@router.get("/pending_friends", response_model=list[FriendResponse])
async def get_pending_friends(db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()

    # Get the current logged-in user's ID
    username = current_user["username"]
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    # Fetch all pending friend requests where the current user is the friend_id
    cursor.execute("""
        SELECT u.username, f.status, f.created_at 
        FROM friends f
        JOIN users u ON f.user_id = u.id
        WHERE f.friend_id = %s AND f.status = 'pending'
    """, (user_id,))
    
    pending_requests = cursor.fetchall()
    cursor.close()

    return [FriendResponse(friend_username=f[0], status=f[1], created_at=f[2]) for f in pending_requests]

@router.post("/accept_friend/{friend_username}")
async def accept_friend(friend_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    cursor.execute("SELECT id FROM users WHERE username = %s", (friend_username,))
    friend = cursor.fetchone()
    if not friend:
        cursor.close()
        raise HTTPException(status_code=404, detail="Friend not found")

    friend_id = friend[0]

    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'pending'", (friend_id, user_id))
    existing_request = cursor.fetchone()

    if not existing_request:
        cursor.close()
        raise HTTPException(status_code=400, detail="No pending friend request from this user")

    cursor.execute("UPDATE friends SET status = 'accepted' WHERE id = %s", (existing_request[0],))
    cursor.execute(
        "INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (%s, %s, %s, %s)",
        (user_id, friend_id, "accepted", datetime.datetime.utcnow())
    )

    db.commit()
    cursor.close()

    return {"message": f"You are now friends with {friend_username}"}

@router.post("/reject_friend/{friend_username}")
async def reject_friend(friend_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    cursor.execute("SELECT id FROM users WHERE username = %s", (friend_username,))
    friend = cursor.fetchone()
    if not friend:
        cursor.close()
        raise HTTPException(status_code=404, detail="Friend not found")

    friend_id = friend[0]

    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'pending'", (friend_id, user_id))
    existing_request = cursor.fetchone()

    if not existing_request:
        cursor.close()
        raise HTTPException(status_code=400, detail="No pending friend request from this user")

    cursor.execute("DELETE FROM friends WHERE id = %s", (existing_request[0],))
    db.commit()
    cursor.close()

    return {"message": f"Friend request from {friend_username} has been rejected"}

@router.post("/block_friend/{friend_username}")
async def block_friend(friend_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    cursor.execute("SELECT id FROM users WHERE username = %s", (friend_username,))
    friend = cursor.fetchone()
    if not friend:
        cursor.close()
        raise HTTPException(status_code=404, detail="Friend not found")

    friend_id = friend[0]

    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s", (user_id, friend_id))
    existing_friendship = cursor.fetchone()

    if not existing_friendship:
        cursor.close()
        raise HTTPException(status_code=400, detail="No friendship found")

    cursor.execute("UPDATE friends SET status = 'blocked' WHERE id = %s", (existing_friendship[0],))
    db.commit()
    cursor.close()

    return {"message": f"You have blocked {friend_username}"}

@router.delete("/delete_friend/{friend_username}")
async def delete_friend(friend_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    cursor.execute("SELECT id FROM users WHERE username = %s", (friend_username,))
    friend = cursor.fetchone()
    if not friend:
        cursor.close()
        raise HTTPException(status_code=404, detail="Friend not found")

    friend_id = friend[0]

    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s", (user_id, friend_id))
    existing_friendship = cursor.fetchone()

    if not existing_friendship:
        cursor.close()
        raise HTTPException(status_code=400, detail="No friendship found")

    cursor.execute("DELETE FROM friends WHERE (user_id = %s AND friend_id = %s) OR (user_id = %s AND friend_id = %s)",
                   (user_id, friend_id, friend_id, user_id))

    db.commit()
    cursor.close()

    return {"message": f"Friend {friend_username} removed successfully"}

@router.get("/friends", response_model=list[FriendResponse])
async def get_friends(db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user[0]

    cursor.execute("""
        SELECT u.username, f.status, f.created_at, 
               MAX(m.created_at) AS last_message_time
        FROM friends f
        JOIN users u ON f.friend_id = u.id
        LEFT JOIN messages m ON (m.sender_id = f.user_id AND m.receiver_id = f.friend_id)
                             OR (m.sender_id = f.friend_id AND m.receiver_id = f.user_id)
        WHERE f.user_id = %s AND f.status != 'pending'
        GROUP BY u.username, f.status, f.created_at
        ORDER BY 
            CASE WHEN MAX(m.created_at) IS NULL THEN 1 ELSE 0 END,  -- Give NULL values a higher priority
            MAX(m.created_at) DESC
    """, (user_id,))

    friends = cursor.fetchall()
    cursor.close()

    return [{"friend_username": f[0], "status": f[1], "created_at": f[2]} for f in friends]



@router.post("/unblock_friend/{friend_username}")
async def unblock_friend(friend_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    cursor = db.cursor()
    username = current_user["username"]

    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        raise HTTPException(status_code=404, detail="User not found")
    user_id = user[0]

    cursor.execute("SELECT id FROM users WHERE username = %s", (friend_username,))
    friend = cursor.fetchone()
    if not friend:
        cursor.close()
        raise HTTPException(status_code=404, detail="Friend not found")
    friend_id = friend[0]

    cursor.execute("SELECT id FROM friends WHERE user_id = %s AND friend_id = %s AND status = 'blocked'", (user_id, friend_id))
    blocked_friendship = cursor.fetchone()
    if not blocked_friendship:
        cursor.close()
        raise HTTPException(status_code=400, detail="No blocked friendship found")

    cursor.execute("UPDATE friends SET status = 'accepted' WHERE id = %s", (blocked_friendship[0],))
    db.commit()
    cursor.close()

    return {"message": f"You have unblocked {friend_username}"}
