import asyncio
import os
import sys
from datetime import datetime, timedelta
import random

# Add parent directory to path to import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "hrms_lite")

async def seed_data():
    print(f"Connecting to MongoDB Atlas: {DATABASE_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Sample Employees - matching the EmployeeModel schema
    employees = [
        {
            "employee_id": "EMP001",
            "full_name": "Rishav Kumar",
            "email": "rishav@hrmslite.com",
            "department": "Engineering",
            "created_at": datetime.now()
        },
        {
            "employee_id": "EMP002",
            "full_name": "Anjali Sharma",
            "email": "anjali@hrmslite.com",
            "department": "Design",
            "created_at": datetime.now()
        },
        {
            "employee_id": "EMP003",
            "full_name": "Rahul Singh",
            "email": "rahul@hrmslite.com",
            "department": "Marketing",
            "created_at": datetime.now()
        },
        {
            "employee_id": "EMP004",
            "full_name": "Priya Verma",
            "email": "priya@hrmslite.com",
            "department": "HR",
            "created_at": datetime.now()
        }
    ]

    print("Seeding Employees...")
    # Clear existing and insert
    await db.employees.delete_many({})
    result = await db.employees.insert_many(employees)
    print(f"✓ Inserted {len(result.inserted_ids)} employees")

    # Seed Attendance for the last 7 days
    print("Seeding Attendance (last 7 days)...")
    await db.attendance.delete_many({})
    
    attendance_records = []
    today = datetime.now()
    
    for i in range(7):
        date = today - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        for emp in employees:
            status = random.choice(["Present", "Present", "Present", "Absent"]) # 75% chance present
            attendance_records.append({
                "employee_id": emp["employee_id"],
                "date": date_str,
                "status": status,
                "marked_at": datetime.now()
            })
    
    if attendance_records:
        result = await db.attendance.insert_many(attendance_records)
        print(f"✓ Inserted {len(result.inserted_ids)} attendance records")

    # Seed Notifications
    print("Seeding Notifications...")
    await db.notifications.delete_many({})
    notifications = [
        {
            "title": "New Employee Onboarded",
            "message": "Rishav Kumar has been added to Engineering department",
            "type": "success",
            "is_read": False,
            "created_at": datetime.now()
        },
        {
            "title": "Attendance Marked",
            "message": "Daily attendance has been updated",
            "type": "info",
            "is_read": False,
            "created_at": datetime.now()
        },
        {
            "title": "System Update",
            "message": "HRMS Lite has been updated to v1.0",
            "type": "info",
            "is_read": True,
            "created_at": datetime.now() - timedelta(days=1)
        }
    ]
    result = await db.notifications.insert_many(notifications)
    print(f"✓ Inserted {len(result.inserted_ids)} notifications")

    print("\n✅ Success! MongoDB Atlas Seeded with all data.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_data())
