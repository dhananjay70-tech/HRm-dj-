from fastapi import APIRouter, HTTPException, Body, status
from fastapi.encoders import jsonable_encoder
from typing import List
from ..database import db
from ..models import EmployeeModel, UpdateEmployeeModel
from pymongo.errors import DuplicateKeyError
from .notifications import create_notification

router = APIRouter()

@router.post("/", response_description="Add new employee", response_model=EmployeeModel, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeModel = Body(...)):
    employee = jsonable_encoder(employee)
    
    # Remove _id if it is None so MongoDB generates a new one
    if "_id" in employee and employee["_id"] is None:
        del employee["_id"]
    
    # Check for duplicates manually if not enforcing unique index strictly yet, 
    # but best to rely on db constraints. For now, we check employee_id.
    existing = await db["employees"].find_one({"employee_id": employee["employee_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this ID already exists")

    new_employee = await db["employees"].insert_one(employee)
    created_employee = await db["employees"].find_one({"_id": new_employee.inserted_id})
    
    # Trigger Notification
    await create_notification(
        title="New Employee Onboarded",
        message=f"{created_employee['full_name']} has been added to the {created_employee['department']} department.",
        n_type="success"
    )
    
    return created_employee

@router.get("/", response_description="List all employees", response_model=List[EmployeeModel])
async def list_employees():
    employees = await db["employees"].find().to_list(1000)
    return employees

@router.get("/{id}", response_description="Get a single employee", response_model=EmployeeModel)
async def show_employee(id: str):
    # Search by public employee_id first, then try object id if needed
    if (employee := await db["employees"].find_one({"employee_id": id})) is not None:
        return employee
    
    raise HTTPException(status_code=404, detail=f"Employee {id} not found")

@router.delete("/{id}", response_description="Delete an employee")
async def delete_employee(id: str):
    delete_result = await db["employees"].delete_one({"employee_id": id})

    if delete_result.deleted_count == 1:
        # Also clean up attendance records? Optional.
        await db["attendance"].delete_many({"employee_id": id})
        return {"message": f"Employee {id} deleted successfully"}

    raise HTTPException(status_code=404, detail=f"Employee {id} not found")
