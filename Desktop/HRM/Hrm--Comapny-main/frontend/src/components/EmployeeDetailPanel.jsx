import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Building, IdCard, Calendar, TrendingUp, User, MapPin, Phone } from 'lucide-react';
import { getAttendanceHistory } from '../services/api';
import { format } from 'date-fns';

const EmployeeDetailPanel = ({ employee, isOpen, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employee && isOpen) {
            fetchHistory();
        }
    }, [employee, isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await getAttendanceHistory(employee.employee_id);
            setHistory(data); // Store all history for calculations
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSummary = () => {
        const present = history.filter(h => h.status === 'Present').length;
        const absent = history.filter(h => h.status === 'Absent').length;
        const rate = history.length > 0 ? Math.round((present / history.length) * 100) : 0;
        return { present, absent, rate };
    };

    const stats = getSummary();

    if (!employee) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-[70] overflow-y-auto border-l border-slate-200 dark:border-slate-800"
                    >
                        {/* Header */}
                        <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 flex items-end">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex items-center gap-5">
                                <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold text-white shadow-xl ring-4 ring-white/10">
                                    {employee.full_name.charAt(0)}
                                </div>
                                <div className="text-white">
                                    <h2 className="text-2xl font-bold leading-tight">{employee.full_name}</h2>
                                    <p className="text-indigo-100 font-medium opacity-80 flex items-center gap-1.5">
                                        <Building size={14} /> {employee.department}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-8 space-y-8">
                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                                    <p className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <IdCard size={14} className="text-primary" /> {employee.employee_id}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <p className="font-bold text-slate-700 dark:text-slate-200">Active</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <User size={16} className="text-primary" /> Contact Details
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Mail size={14} />
                                        </div>
                                        <span className="text-sm font-medium">{employee.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                            <Phone size={14} />
                                        </div>
                                        <span className="text-sm font-medium">+91 98765 43210</span>
                                    </div>
                                </div>
                            </div>

                            {/* Attendance Summary Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-center">
                                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mb-1">Present</p>
                                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{stats.present}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/50 text-center">
                                    <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tighter mb-1">Absent</p>
                                    <p className="text-xl font-black text-rose-700 dark:text-rose-300">{stats.absent}</p>
                                </div>
                                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 text-center">
                                    <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter mb-1">Rate</p>
                                    <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">{stats.rate}%</p>
                                </div>
                            </div>

                            {/* Attendance Heatmap (Visual Consistency) */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <TrendingUp size={16} className="text-primary" /> Consistency Map
                                </h3>
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-1 flex-wrap">
                                        {Array(28).fill(0).map((_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (27 - i));
                                            const dateStr = d.toISOString().split('T')[0];
                                            const record = history.find(h => h.date === dateStr);

                                            return (
                                                <div
                                                    key={i}
                                                    title={dateStr}
                                                    className={`h-3 w-3 rounded-sm transition-all duration-500 hover:scale-150 cursor-pointer ${!record ? 'bg-slate-200 dark:bg-slate-700' :
                                                        record.status === 'Present' ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-rose-500'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>4 Weeks Ago</span>
                                        <span>Today</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    [1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl animate-pulse" />)
                                ) : history.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic text-center py-4">No records found yet.</p>
                                ) : (
                                    history.slice(0, 5).map((rec, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2 w-2 rounded-full ${rec.status === 'Present' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'}`} />
                                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{format(new Date(rec.date), 'MMM dd, yyyy')}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${rec.status === 'Present' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-rose-600 bg-rose-50 dark:bg-rose-900/30'}`}>
                                                {rec.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="sticky bottom-0 bg-white dark:bg-slate-900 p-6 border-t border-slate-100 dark:border-slate-800">
                            <button className="w-full py-4 rounded-2xl bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                <Calendar size={18} /> View Monthly Report
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default EmployeeDetailPanel;
