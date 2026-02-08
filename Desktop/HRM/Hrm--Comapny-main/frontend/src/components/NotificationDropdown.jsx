import React, { useEffect, useState, useRef } from 'react';
import { getNotifications, markAsRead, markAllRead } from '../services/api';
import { motion } from 'framer-motion';
import { Bell, Check, X, AlertCircle, Info, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

const NotificationDropdown = ({ onClose, onCountChange }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Close on outside click
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const fetchNotifications = async () => {
        try {
            const { data } = await getNotifications();
            setNotifications(data);
            const unreadCount = data.filter(n => !n.is_read).length;
            if (onCountChange) onCountChange(unreadCount);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markAsRead(id);
            setNotifications(prev => {
                const updated = prev.map(n => n._id === id ? { ...n, is_read: true } : n);
                const unreadCount = updated.filter(n => !n.is_read).length;
                if (onCountChange) onCountChange(unreadCount);
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllRead();
            setNotifications(prev => {
                const updated = prev.map(n => ({ ...n, is_read: true }));
                if (onCountChange) onCountChange(0);
                return updated;
            });
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="text-emerald-500" size={18} />;
            case 'warning': return <AlertCircle className="text-amber-500" size={18} />;
            case 'error': return <X className="text-rose-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    return (
        <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 z-[100] overflow-hidden"
        >
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 text-sm sm:text-base">
                    <Bell size={16} className="text-primary" /> Notifications
                </h3>
                <div className="flex items-center gap-2">
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-primary hover:text-indigo-400 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
                {loading ? (
                    <div className="p-10 text-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-10 text-center text-slate-400">
                        <Bell size={40} className="mx-auto mb-4 opacity-10" />
                        <p className="text-sm font-medium italic">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {notifications.map((notif) => (
                            <div
                                key={notif._id}
                                className={`p-4 flex gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${!notif.is_read ? 'bg-indigo-50/30 dark:bg-primary/5' : ''}`}
                            >
                                <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-800 shadow-sm'}`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 space-y-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className={`text-xs sm:text-sm font-bold truncate ${notif.is_read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {notif.title}
                                        </p>
                                        {!notif.is_read && (
                                            <button
                                                onClick={() => handleMarkRead(notif._id)}
                                                className="p-1 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                            >
                                                <Check size={10} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <div className="flex items-center gap-1.5 pt-1 text-[9px] sm:text-[10px] font-bold text-slate-400">
                                        <Clock size={9} />
                                        {format(new Date(notif.created_at), 'hh:mm a, MMM dd')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
                <button
                    onClick={onClose}
                    className="w-full py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    Close Notifications
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationDropdown;
