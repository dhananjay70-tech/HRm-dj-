from fastapi import APIRouter, HTTPException, Body, status
from fastapi.encoders import jsonable_encoder
from typing import List
from datetime import date, datetime
from ..database import db
from ..models import AttendanceModel
from .notifications import create_notification

router = APIRouter()

@router.post("/", response_description="Mark attendance", response_model=AttendanceModel, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceModel = Body(...)):
    # Check if employee exists
    employee = await db["employees"].find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check if attendance already marked for this date
    # Convert date to string for query if stored as string, or keep as date object depending on serialization
    # jsonable_encoder converts date to string 'YYYY-MM-DD'
    attendance_data = jsonable_encoder(attendance)
    
    # Remove _id if it is None so MongoDB generates a new one
    if "_id" in attendance_data and attendance_data["_id"] is None:
        del attendance_data["_id"]

    existing = await db["attendance"].find_one({
        "employee_id": attendance.employee_id,
        "date": attendance_data["date"]
    })
    
    if existing:
        # Update instead of duplicate? Or error? Let's error for now as per "Mark Present/Absent" usually implies one entry.
        # However, user might want to change it. Let's update it.
        await db["attendance"].update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": attendance.status, "marked_at": datetime.now()}}
        )
        return await db["attendance"].find_one({"_id": existing["_id"]})
        
    new_attendance = await db["attendance"].insert_one(attendance_data)
    created_attendance = await db["attendance"].find_one({"_id": new_attendance.inserted_id})

    # Trigger Notification for Attendance
    if created_attendance["status"] == "Absent":
        await create_notification(
            title="Employee Absent Alert",
            message=f"{employee['full_name']} has been marked as Absent for today.",
            n_type="warning"
        )
    else:
        await create_notification(
            title="Attendance Marked",
            message=f"{employee['full_name']} has been marked as Present.",
            n_type="success"
        )

    return created_attendance

@router.get("/date/{date_str}", response_description="Get attendance for all employees for a specific date", response_model=List[AttendanceModel])
async def get_attendance_by_date(date_str: str):
    attendance_records = await db["attendance"].find({"date": date_str}).to_list(1000)
    return attendance_records

@router.get("/{employee_id}", response_description="Get attendance history for an employee", response_model=List[AttendanceModel])
async def get_attendance_history(employee_id: str):
    attendance_history = await db["attendance"].find({"employee_id": employee_id}).sort("date", -1).to_list(1000)
    return attendance_history

@router.get("/stats/summary", response_description="Get dashboard stats")
async def get_stats():
    # Simple stats for today
    today_str = date.today().isoformat()
    
    total_employees = await db["employees"].count_documents({})
    present_today = await db["attendance"].count_documents({"date": today_str, "status": "Present"})
    absent_today = await db["attendance"].count_documents({"date": today_str, "status": "Absent"})
    
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today
    }
@router.get("/stats/weekly", response_description="Get weekly attendance stats")
async def get_weekly_stats():
    from datetime import timedelta
    
    today = date.today()
    weekly_stats = []
    
    total_employees = await db["employees"].count_documents({})
    
    # Show last 7 days including today
    for i in range(6, -1, -1):
        current_date = today - timedelta(days=i)
        date_str = current_date.isoformat()
        day_name = current_date.strftime("%a") # Sun, Mon...
        
        present_count = await db["attendance"].count_documents({"date": date_str, "status": "Present"})
        absent_count = await db["attendance"].count_documents({"date": date_str, "status": "Absent"})
        
        # Calculate percentage based on total employees
        if total_employees > 0:
            present_percent = (present_count / total_employees) * 100
            absent_percent = (absent_count / total_employees) * 100
        else:
            present_percent = 0
            absent_percent = 0
            
        weekly_stats.append({
            "day": day_name,
            "present": round(present_percent),
            "absent": round(absent_percent),
            "date": date_str,
            "present_count": present_count,
            "absent_count": absent_count,
            "total_marked": present_count + absent_count
        })
        
    return weekly_stats
@router.get("/stats/recent", response_description="Get recent activity")
async def get_recent_activity():
    # Fetch recent attendance marks
    recent = await db["attendance"].find().sort("marked_at", -1).to_list(5)
    
    activity = []
    for entry in recent:
        employee = await db["employees"].find_one({"employee_id": entry["employee_id"]})
        name = employee["full_name"] if employee else "Unknown"
        
        # Calculate time ago (simple version)
        marked_at = entry["marked_at"]
        if isinstance(marked_at, str):
             marked_at = datetime.fromisoformat(marked_at.replace('Z', '+00:00'))
        
        diff = datetime.now() - marked_at
        if diff.seconds < 3600:
            time_str = f"{diff.seconds // 60} mins ago"
        elif diff.days == 0:
            time_str = f"{diff.seconds // 3600} hours ago"
        else:
            time_str = f"{diff.days} days ago"

        activity.append({
            "user": name,
            "action": f"marked {entry['status']}",
            "time": time_str,
            "initial": name[0],
            "color": "bg-blue-100 text-blue-600" if entry['status'] == "Present" else "bg-rose-100 text-rose-600"
        })
    
    return activity
