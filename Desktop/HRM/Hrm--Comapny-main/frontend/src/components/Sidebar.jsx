import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, Calendar, LogOut, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const Sidebar = ({ isCollapsed, toggleSidebar, onProfileClick }) => {
    const [adminProfile, setAdminProfile] = useState({
        name: 'Admin User',
        email: 'hr@company.com',
        avatar: null
    });

    const loadProfile = useCallback(() => {
        const saved = localStorage.getItem('adminProfile');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setAdminProfile({
                    name: data.name || 'Admin User',
                    email: data.email || 'hr@company.com',
                    avatar: data.avatar || null
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        loadProfile();
        window.addEventListener('adminProfileUpdated', loadProfile);
        return () => window.removeEventListener('adminProfileUpdated', loadProfile);
    }, [loadProfile]);

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/employees', icon: Users, label: 'Employees' },
        { path: '/attendance', icon: Clock, label: 'Mark Attendance' },
        { path: '/calendar', icon: Calendar, label: 'Work Calendar' },
    ];

    const initials = adminProfile.name.split(' ').map(n => n[0]).join('');

    return (
        <>
            {/* Mobile Overlay */}
            {!isCollapsed && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-500 ease-in-out z-50 flex flex-col shadow-[1px_0_20px_rgba(0,0,0,0.02)] 
                    ${isCollapsed ? 'w-20 -translate-x-full lg:translate-x-0' : 'w-72 translate-x-0'} 
                    lg:w-auto ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
            >
                {/* Logo */}
                <div className={`p-6 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                    <div className="h-10 px-3 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg font-black text-sm">Nexa</div>
                    {!isCollapsed && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight">NexaHR</h1>
                            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Control Center</p>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                            ${isActive
                                    ? 'bg-indigo-50 dark:bg-primary/10 text-primary shadow-[0_0_15px_rgba(79,70,229,0.05)]'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
                                }
                            ${isCollapsed ? 'justify-center px-0' : ''}
                        `}
                            title={isCollapsed ? item.label : ''}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={22} className={`transition-transform duration-300 group-active:scale-90 ${isCollapsed ? 'mx-auto' : ''}`} />
                                    {!isCollapsed && (
                                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    )}
                                    {isActive && !isCollapsed && (
                                        <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout & Collapse Button */}
                <div className={`p-4 mt-auto border-t border-slate-50 dark:border-slate-800/50 space-y-4`}>
                    {!isCollapsed && (
                        <div
                            onClick={onProfileClick}
                            className="flex items-center p-3 gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-white/5 transition-all cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm active:scale-95 group"
                        >
                            <div className="h-10 w-10 min-w-[2.5rem] rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-primary flex items-center justify-center font-bold text-xs overflow-hidden">
                                {adminProfile.avatar ? (
                                    <img src={adminProfile.avatar} alt="Admin" className="h-full w-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">{adminProfile.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate">{adminProfile.email}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <button className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 font-bold transition-all group overflow-hidden ${isCollapsed ? 'justify-center px-0' : ''}">
                            <LogOut size={20} className={`${isCollapsed ? 'mx-auto' : ''}`} />
                            {!isCollapsed && <span className="text-sm">Sign Out</span>}
                        </button>

                        <button
                            onClick={toggleSidebar}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all shadow-lg group ${isCollapsed ? 'justify-center px-0' : ''}"
                        >
                            {isCollapsed ? <ChevronRight size={20} className="mx-auto" /> : <ChevronLeft size={20} />}
                            {!isCollapsed && <span className="text-sm font-bold">Collapse</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
