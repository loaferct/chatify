from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from datetime import datetime
from typing import Dict, List
from database import get_db
from routers.auth import verify_token, get_current_user# Create a function to verify tokens
from model.message import MessageCreate, MessageResponse

router = APIRouter()

# Store active WebSocket connections
active_connections: Dict[int, List[WebSocket]] = {}

async def get_user_from_token(websocket: WebSocket, db):
    """Extract and verify the user from the token in query params."""
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)  # No token provided
        return None

    user = verify_token(token)  # Verify the token
    if not user:
        await websocket.close(code=4001)  # Invalid token
        return None

    # Fetch user ID from the database
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE username = %s", (user["username"],))
    result = cursor.fetchone()
    cursor.close()

    if not result:
        await websocket.close(code=4001)  # User not found
        return None

    return {"id": result[0], "username": user["username"]}

@router.websocket("/ws/chat/{receiver_username}")
async def websocket_chat(websocket: WebSocket, receiver_username: str, db=Depends(get_db)):
    """
    WebSocket endpoint for real-time chat between two users.
    """
    # Get the sender's details
    sender = await get_user_from_token(websocket, db)
    if not sender:
        return  # User was closed due to invalid token

    sender_id = sender["id"]

    # Get the receiver's ID
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE username = %s", (receiver_username,))
    receiver = cursor.fetchone()
    cursor.close()

    if not receiver:
        await websocket.close(code=4001)  # Invalid recipient
        return

    receiver_id = receiver[0]

    # Accept the WebSocket connection
    await websocket.accept()

    # Store the connection
    if sender_id not in active_connections:
        active_connections[sender_id] = []
    active_connections[sender_id].append(websocket)

    try:
        while True:
            # Wait for a new message
            data = await websocket.receive_json()
            content = data.get("content")

            if not content:
                continue  # Ignore empty messages

            # Insert message into database
            cursor = db.cursor()
            cursor.execute(
                """
                INSERT INTO messages (sender_id, receiver_id, content, created_at, is_read) 
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, created_at
                """,
                (sender_id, receiver_id, content, datetime.utcnow(), False)
            )
            db.commit()
            msg_id, created_at = cursor.fetchone()
            cursor.close()

            message_response = {
                "id": msg_id,
                "sender_id": sender_id,
                "receiver_id": receiver_id,
                "content": content,
                "created_at": created_at,
                "is_read": False,
            }

            # Send the message to the recipient if they are online
            if receiver_id in active_connections:
                for ws in active_connections[receiver_id]:  # Send to all open sessions
                    await ws.send_json(message_response)

            # Send confirmation back to sender
            for ws in active_connections[sender_id]:
                await ws.send_json(message_response)

    except WebSocketDisconnect:
        # Remove the disconnected WebSocket
        active_connections[sender_id].remove(websocket)
        if not active_connections[sender_id]:  # Remove empty lists
            del active_connections[sender_id]

    finally:
        cursor.close()


@router.get("/chat-history/{other_username}", response_model=List[MessageResponse])
async def get_chat_history(other_username: str, db=Depends(get_db), current_user=Depends(get_current_user)):
    """
    Retrieves the chat history between the logged-in user and another user.
    """
    username = current_user["username"]

    # Get the user IDs for the logged-in user and the other user
    cursor = db.cursor()
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    sender = cursor.fetchone()
    if not sender:
        cursor.close()
        raise HTTPException(status_code=404, detail="Sender not found")

    user_id = sender[0]

    cursor.execute("SELECT id FROM users WHERE username = %s", (other_username,))
    other_user = cursor.fetchone()

    if not other_user:
        cursor.close()
        raise HTTPException(status_code=404, detail="Other user not found")

    other_user_id = other_user[0]

    # Fetch chat history with sender and receiver names
    cursor.execute(
        """
        SELECT m.id, m.sender_id, m.receiver_id, m.content, m.created_at, m.is_read,
               u1.username AS sender_name, u2.username AS receiver_name
        FROM messages m
        JOIN users u1 ON m.sender_id = u1.id
        JOIN users u2 ON m.receiver_id = u2.id
        WHERE (m.sender_id = %s AND m.receiver_id = %s) OR (m.sender_id = %s AND m.receiver_id = %s)
        ORDER BY m.created_at ASC
        """,
        (user_id, other_user_id, other_user_id, user_id),
    )
    messages = cursor.fetchall()
    cursor.close()

    # Prepare the response with sender_name and receiver_name
    response = []
    for msg in messages:
        # Set "you" for the logged-in user
        if msg[1] == user_id:
            sender_name = "you"
            receiver_name = other_username
        else:
            sender_name = other_username
            receiver_name = "you"

        response.append({
            "id": msg[0],
            "sender_id": msg[1],
            "receiver_id": msg[2],
            "content": msg[3],
            "created_at": msg[4],
            "is_read": msg[5],
            "sender_name": sender_name,
            "receiver_name": receiver_name,
        })

    return response

