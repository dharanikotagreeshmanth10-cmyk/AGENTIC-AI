import random
import string
from fastapi import APIRouter, HTTPException, status
from app.schemas.user_schema import UserRegister, UserLogin, UserResponse
from app.database.mongodb import get_collection, is_connected
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def generate_unique_id() -> str:
    chars = string.ascii_uppercase + string.digits
    return "ECO-" + "".join(random.choice(chars) for _ in range(6))

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister):
    if not is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MongoDB is not connected. Database storage unavailable."
        )

    users_col = get_collection("users")
    
    # Check if email is already taken
    existing_user = await users_col.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Generate a unique ID and make sure it's unique in the collection
    unique_id = None
    for _ in range(10): # try 10 times to prevent duplicates
        temp_id = generate_unique_id()
        dup = await users_col.find_one({"unique_id": temp_id})
        if not dup:
            unique_id = temp_id
            break
            
    if not unique_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate a unique ID. Please try again."
        )

    new_user = {
        "unique_id": unique_id,
        "name": user_data.name.strip(),
        "email": user_data.email.lower().strip(),
        "phone": user_data.phone.strip(),
        # For simplicity, storing password directly. In production, hash it!
        "password": user_data.password,
    }

    try:
        await users_col.insert_one(new_user)
        logger.info(f"Registered user {user_data.email} with ID {unique_id}")
        return {
            "uniqueId": unique_id,
            "name": new_user["name"],
            "email": new_user["email"],
            "phone": new_user["phone"]
        }
    except Exception as e:
        logger.error(f"Error inserting user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register user: {str(e)}"
        )

@router.post("/login", response_model=UserResponse)
async def login(login_data: UserLogin):
    if not is_connected():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="MongoDB is not connected. Database storage unavailable."
        )

    users_col = get_collection("users")
    
    # Search for user matching the credentials
    user = await users_col.find_one({
        "unique_id": login_data.uniqueId,
        "password": login_data.password
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid unique ID, name, or password."
        )

    # Simple name match validation (case insensitive)
    if user["name"].lower() != login_data.name.lower():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid name match for this unique ID."
        )

    return {
        "uniqueId": user["unique_id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"]
    }
