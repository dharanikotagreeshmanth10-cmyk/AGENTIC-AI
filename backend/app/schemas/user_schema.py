from pydantic import BaseModel, Field

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    phone: str = Field(..., pattern=r"^\+?[\d\s\-()]{7,15}$")
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    uniqueId: str = Field(..., alias="uniqueId")
    name: str
    password: str

    class Config:
        populate_by_name = True

class UserResponse(BaseModel):
    uniqueId: str = Field(..., alias="uniqueId")
    name: str
    email: str
    phone: str

    class Config:
        populate_by_name = True
