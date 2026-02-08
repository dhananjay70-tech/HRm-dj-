from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional, Annotated
from datetime import datetime, date
from bson import ObjectId

# Helper for PyObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class EmployeeModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    employee_id: str = Field(..., min_length=1)
    full_name: str = Field(..., min_length=1)
    email: EmailStr
    department: str
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "employee_id": "E001",
                "full_name": "John Doe",
                "email": "john@example.com",
                "department": "Engineering"
            }
        }

class UpdateEmployeeModel(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None

class AttendanceModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    employee_id: str # References EmployeeModel.employee_id
    date: date
    status: str = Field(..., pattern="^(Present|Absent)$") 
    marked_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "employee_id": "E001",
                "date": "2023-10-27",
                "status": "Present"
            }
        }

class NotificationModel(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    message: str
    type: str  # 'info', 'warning', 'error', 'success'
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "title": "New Employee",
                "message": "John Doe has been added to Engineering",
                "type": "success"
            }
        }
