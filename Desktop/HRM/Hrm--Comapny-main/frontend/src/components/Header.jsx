import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Search, Moon, Sun, Sparkles, Menu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getUnreadCount } from '../services/api';
import NotificationDropdown from './NotificationDropdown';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ title, onProfileClick, toggleSidebar }) => {
    const { isDark, toggleTheme } = useTheme();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin User',
        avatar: null
    });

    const loadProfile = useCallback(() => {
        const saved = localStorage.getItem('adminProfile');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setAdminProfile({
                    name: data.name || 'Admin User',
                    avatar: data.avatar || null
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const fetchUnread = useCallback(async () => {
        try {
            const { data } = await getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadProfile();
        fetchUnread();
        const interval = setInterval(fetchUnread, 5000); // Check every 5 seconds
        window.addEventListener('adminProfileUpdated', loadProfile);
        return () => {
            clearInterval(interval);
            window.removeEventListener('adminProfileUpdated', loadProfile);
        };
    }, [fetchUnread, loadProfile]);

    const initials = adminProfile.name.split(' ').map(n => n[0]).join('');

    return (
        <header className="h-20 sm:h-24 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-8 transition-all duration-300">
            <div className="flex items-center gap-3 sm:gap-4">
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden lg:flex items-center gap-3">
                    <div className="h-10 px-3 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg font-black text-sm">Nexa</div>
                    <div className="text-sm font-extrabold tracking-tight text-slate-800 dark:text-white">NexaHR</div>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[150px] sm:max-w-none">{title}</h2>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 lg:gap-8">
                <div className="relative hidden xl:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Global search..."
                        className="pl-12 pr-6 py-3 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 text-sm w-80 outline-none transition-all placeholder:text-slate-500 dark:text-slate-400 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 sm:p-3 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all"
                    >
                        {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="relative p-2.5 sm:p-3 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-2 right-2 w-4 sm:w-5 h-4 sm:h-5 bg-rose-500 rounded-full ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-[10px] font-black text-white"
                                >
                                    {unreadCount}
                                </motion.span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <NotificationDropdown
                                    onClose={() => setIsNotifOpen(false)}
                                    onCountChange={(count) => setUnreadCount(count)}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 sm:mx-2 hidden xs:block" />

                    <div
                        onClick={onProfileClick}
                        className="flex items-center gap-2 sm:gap-3 cursor-pointer group hover:bg-white dark:hover:bg-slate-800 p-1.5 sm:p-2 lg:pr-4 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all active:scale-95 shadow-sm"
                    >
                        <div className="relative">
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md overflow-hidden">
                                {adminProfile.avatar ? (
                                    <img src={adminProfile.avatar} alt="Admin" className="h-full w-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                        </div>
                        <div className="text-xs sm:text-sm hidden sm:block">
                            <p className="font-black text-slate-800 dark:text-white leading-none truncate max-w-[80px]">{adminProfile.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[80px]">Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
