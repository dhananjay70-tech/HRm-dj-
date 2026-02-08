import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AdminProfileModal from './AdminProfileModal';
import { AnimatePresence, motion } from 'framer-motion';

const Layout = () => {
    // Default collapsed on mobile, expanded on desktop
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarCollapsed(true);
            } else {
                setIsSidebarCollapsed(false);
            }
        };

        window.addEventListener('resize', handleResize);
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const getTitle = () => {
        const path = location.pathname;
        if (path === '/') return 'Overview';
        if (path === '/employees') return 'Team Members';
        if (path === '/attendance') return 'Attendance Management';
        if (path === '/calendar') return 'Work Calendar';
        return 'NexaHR';
    };

    return (
        <div className="min-h-screen animate-mesh flex transition-colors duration-300 font-sans relative overflow-hidden">
            {/* Neural Spotlight Effect */}
            <div
                className="pointer-events-none fixed inset-0 z-[60] transition-opacity duration-300 opacity-0 lg:opacity-100"
                style={{
                    background: `radial-gradient(600px at ${mousePos.x}px ${mousePos.y}px, rgba(79, 70, 229, 0.04), transparent 80%)`
                }}
            />

            {/* Background Orbs for added depth */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onProfileClick={() => setIsProfileOpen(true)}
            />

            <div className={`flex-1 flex flex-col min-w-0 min-h-screen ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} transition-all duration-500 ease-in-out relative z-10`}>
                <Header
                    title={getTitle()}
                    onProfileClick={() => setIsProfileOpen(true)}
                    toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
                <main className="flex-1 p-4 lg:p-8 pt-0 overflow-y-auto w-full max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15, scale: 0.99 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -15, scale: 0.99 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <AdminProfileModal
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
            />
        </div>
    );
};

export default Layout;
