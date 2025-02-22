from fastapi import APIRouter, HTTPException, Depends, Security, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from model.user import UserCreate, UserLogin, User
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from database import get_db
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Fetching values from .env file
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")  # Default to "HS256" if not set
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))  # Default to 30 minutes if not set

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Security(oauth2_scheme)):
    """
    Extracts the current user from the JWT token.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token")
        return {"username": username}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


@router.post("/signup", response_model=User)
async def signup(user: UserCreate, db=Depends(get_db)):
    """
    Registers a new user.
    """
    cursor = db.cursor()

    cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
    db_user = cursor.fetchone()
    if db_user:
        cursor.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    cursor.execute("SELECT id FROM users WHERE username = %s", (user.username,))
    db_user = cursor.fetchone()
    if db_user:
        cursor.close()
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = get_password_hash(user.password)
    query = "INSERT INTO users (username, email, password, created_at) VALUES (%s, %s, %s, %s)"
    cursor.execute(query, (user.username, user.email, hashed_password, datetime.utcnow()))
    db.commit()

    cursor.execute("SELECT id, username, email, created_at FROM users WHERE email = %s", (user.email,))
    new_user = cursor.fetchone()

    cursor.close()

    return User(id=new_user[0], username=new_user[1], email=new_user[2], created_at=new_user[3])


@router.post("/token")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db=Depends(get_db)
):
    cursor = db.cursor()

    cursor.execute("SELECT id, username, email, password FROM users WHERE username = %s", (form_data.username,))
    db_user = cursor.fetchone()

    if db_user is None or not verify_password(form_data.password, db_user[3]):
        cursor.close()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(data={"sub": db_user[1]})

    cursor.close()
    return {"access_token": access_token, "token_type": "bearer"}

def verify_token(token: str):
    """
    Verifies a JWT token and returns the user data if valid.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None  # Invalid token
        
        return {"username": username}  # Return user info as a dictionary
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token
