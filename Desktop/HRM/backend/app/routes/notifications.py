from fastapi import APIRouter, HTTPException, Body, status
from typing import List
from ..database import db
from ..models import NotificationModel
from datetime import datetime

router = APIRouter()

@router.get("/", response_description="List all notifications", response_model=List[NotificationModel])
async def get_notifications():
    notifications = await db["notifications"].find().sort("created_at", -1).to_list(100)
    return notifications

@router.get("/unread/count")
async def get_unread_count():
    count = await db["notifications"].count_documents({"is_read": False})
    return {"count": count}

@router.put("/{id}/read")
async def mark_as_read(id: str):
    from bson import ObjectId
    update_result = await db["notifications"].update_one(
        {"_id": ObjectId(id)}, {"$set": {"is_read": True}}
    )
    if update_result.modified_count == 1:
        return {"message": "Notification marked as read"}
    raise HTTPException(status_code=404, detail=f"Notification {id} not found")

@router.put("/read-all")
async def mark_all_as_read():
    await db["notifications"].update_many(
        {"is_read": False}, {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}

async def create_notification(title: str, message: str, n_type: str = "info"):
    new_notif = {
        "title": title,
        "message": message,
        "type": n_type,
        "is_read": False,
        "created_at": datetime.now()
    }
    await db["notifications"].insert_one(new_notif)
