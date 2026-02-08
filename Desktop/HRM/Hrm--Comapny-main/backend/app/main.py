from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import employees, attendance, notifications

app = FastAPI(title="HRMS Lite API", version="1.0.0")

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "https://hrm-comapny.vercel.app",
    "https://hrm-comapny-*.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(employees.router, tags=["Employees"], prefix="/api/employees")
app.include_router(attendance.router, tags=["Attendance"], prefix="/api/attendance")
app.include_router(notifications.router, tags=["Notifications"], prefix="/api/notifications")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to HRMS Lite API"}
