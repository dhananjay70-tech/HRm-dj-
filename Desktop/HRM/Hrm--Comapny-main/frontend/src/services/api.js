import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getEmployees = () => api.get('/employees/');
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const addEmployee = (data) => api.post('/employees/', data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export const markAttendance = (data) => api.post('/attendance/', data);
export const getAttendanceByDate = (date) => api.get(`/attendance/date/${date}`);
export const getAttendanceHistory = (employeeId) => api.get(`/attendance/${employeeId}`);
export const getStats = () => api.get('/attendance/stats/summary');
export const getWeeklyStats = () => api.get('/attendance/stats/weekly');
export const getRecentActivity = () => api.get('/attendance/stats/recent');

// Notifications
export const getNotifications = () => api.get('/notifications/');
export const getUnreadCount = () => api.get('/notifications/unread/count');
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');

export default api;
