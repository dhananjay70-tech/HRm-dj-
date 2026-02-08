import React, { useState } from 'react';
import { Plus, User, Calendar, FileText, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingActionPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const actions = [
        { icon: User, label: 'Add Employee', action: () => { navigate('/employees'); setIsOpen(false); }, color: 'bg-blue-500' },
        { icon: Calendar, label: 'Mark Attendance', action: () => { navigate('/attendance'); setIsOpen(false); }, color: 'bg-emerald-500' },
        { icon: FileText, label: 'View Reports', action: () => { /* TODO */ setIsOpen(false); }, color: 'bg-purple-500' },
    ];

    return (
        <>
            {/* FAB Menu Background Click Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* FAB Panel */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
                {/* Menu Items */}
                {isOpen && (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {actions.map((action, i) => (
                            <button
                                key={i}
                                onClick={action.action}
                                className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
                            >
                                <div className={`p-2 rounded-full ${action.color} text-white`}>
                                    <action.icon size={18} />
                                </div>
                                <span className="text-sm font-semibold text-slate-700 dark:text-white whitespace-nowrap hidden sm:inline">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Main FAB Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`h-14 w-14 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform ${
                        isOpen ? 'rotate-45' : ''
                    }`}
                >
                    {isOpen ? <X size={24} /> : <Plus size={24} />}
                </button>
            </div>
        </>
    );
};

export default FloatingActionPanel;
