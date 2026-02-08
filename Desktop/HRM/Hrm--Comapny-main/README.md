# HRMS Lite - Modern HR Management System

A premium, full-stack HR Management System built with **React** (Frontend) and **FastAPI** (Backend), powered by **MongoDB Atlas** for cloud database storage.

## 🚀 Features

### ✨ Core Functionality
- **Employee Management**: Add, view, and manage employee records with detailed profiles
- **Attendance Tracking**: Mark daily attendance with real-time status updates
- **Work Calendar**: Visual monthly calendar showing attendance patterns
- **Dashboard Analytics**: Real-time stats, weekly charts, and activity feed
- **Profile Management**: Admin profile with photo upload and editable details
- **Dark Mode**: Seamless theme switching with persistent preferences
- **Notifications**: Real-time notification system with unread counts

### 🎨 Design Highlights
- Premium glassmorphism UI with smooth animations
- Fully responsive design (mobile, tablet, desktop)
- Modern color palette with gradient accents
- Interactive hover effects and micro-animations
- Clean typography and intuitive navigation

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Framer Motion** for animations
- **Lucide React** for icons
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **FastAPI** (Python)
- **Motor** (Async MongoDB driver)
- **Pydantic** for data validation
- **Uvicorn** ASGI server

### Database
- **MongoDB Atlas** (Cloud)

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB Atlas account

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   source venv/bin/activate  # Mac/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file:
   ```env
   MONGODB_URL=your_mongodb_atlas_connection_string
   DATABASE_NAME=hrms_lite
   PORT=8000
   ```

5. Seed the database:
   ```bash
   python scripts/seed_atlas.py
   ```

6. Run the server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open browser at `http://localhost:5175`

## 🎯 Usage

### Default Admin Profile
- **Name**: Admin User
- **Email**: hr@company.com

### Quick Actions
1. **Add Employee**: Click "Add Employee" button on Employees page
2. **Mark Attendance**: Navigate to "Mark Attendance" and select employees
3. **View Calendar**: Check monthly attendance patterns in Work Calendar
4. **Edit Profile**: Click on admin avatar in header or sidebar

## 📁 Project Structure

```
HRM-Website/
├── backend/
│   ├── app/
│   │   ├── routes/          # API endpoints
│   │   ├── models.py        # Pydantic models
│   │   ├── database.py      # MongoDB connection
│   │   └── main.py          # FastAPI app
│   ├── scripts/
│   │   └── seed_atlas.py    # Database seeding
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── App.jsx
│   ├── public/
│   └── package.json
└── README.md
```

## 🌐 API Endpoints

### Employees
- `GET /api/employees/` - List all employees
- `POST /api/employees/` - Add new employee
- `GET /api/employees/{id}` - Get employee details
- `DELETE /api/employees/{id}` - Delete employee

### Attendance
- `POST /api/attendance/` - Mark attendance
- `GET /api/attendance/date/{date}` - Get attendance by date
- `GET /api/attendance/stats/summary` - Get dashboard stats
- `GET /api/attendance/stats/weekly` - Get weekly attendance

### Notifications
- `GET /api/notifications/` - Get all notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/{id}/read` - Mark as read

## 🎨 Color Palette

- **Primary**: `#4F46E5` (Indigo)
- **Success**: `#10B981` (Emerald)
- **Error**: `#EF4444` (Rose)
- **Warning**: `#F59E0B` (Amber)

## 🚧 Future Enhancements

- [ ] Leave management system
- [ ] Payroll integration
- [ ] Performance reviews
- [ ] Document management
- [ ] Email notifications
- [ ] Export reports (PDF/Excel)
- [ ] Multi-language support
- [ ] Role-based access control

## 👨‍💻 Developer

**Rishav Kumar**
- GitHub: [@Rishav5505](https://github.com/Rishav5505)

## 📄 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React, FastAPI, and MongoDB Atlas**
