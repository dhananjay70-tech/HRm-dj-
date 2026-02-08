import React, { useState } from 'react';
import { Bell, Search, LogOut, Settings, User, Menu, X } from 'lucide-react';

const TopNav = ({ onLogout, userName = 'Admin' }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-40">
                <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                                <span className="text-white font-black text-sm">N</span>
                            </div>
                            <span className="font-black text-lg text-slate-900 dark:text-white hidden sm:inline">NexaHR</span>
                        </div>

                        {/* Desktop Navigation Links */}
                        <div className="hidden lg:flex items-center gap-6">
                            <a href="/dashboard" className="text-sm font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition">Dashboard</a>
                            <a href="/employees" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Employees</a>
                            <a href="/attendance" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Attendance</a>
                            <a href="/calendar" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Calendar</a>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar (Desktop) */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Search size={16} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder-slate-400"
                            />
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                            <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Menu (Desktop) */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                                {userName.charAt(0)}
                            </div>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</span>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        >
                            {isOpen ? (
                                <X size={20} className="text-slate-600 dark:text-slate-300" />
                            ) : (
                                <Menu size={20} className="text-slate-600 dark:text-slate-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 md:hidden">
                        <div className="flex flex-col p-4 gap-3">
                            <a href="/dashboard" className="px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Dashboard</a>
                            <a href="/employees" className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Employees</a>
                            <a href="/attendance" className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Attendance</a>
                            <a href="/calendar" className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">Calendar</a>
                            <hr className="border-slate-200 dark:border-slate-800" />
                            <button className="px-3 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-left flex items-center gap-2">
                                <Settings size={16} /> Settings
                            </button>
                            <button onClick={onLogout} className="px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-left flex items-center gap-2">
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};

export default TopNav;
