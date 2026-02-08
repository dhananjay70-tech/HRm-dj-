import React, { useEffect, useState, useCallback } from 'react';
import { getEmployees, markAttendance, getAttendanceByDate } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { format } from 'date-fns';
import { Calendar, CheckCircle, XCircle, Users, Search, Save, Clock, Check } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // Stores { status, marked_at, isDirty }
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { addToast } = useToast();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [empRes, attRes] = await Promise.all([
                getEmployees(),
                getAttendanceByDate(date)
            ]);

            setEmployees(empRes.data);

            // Map attendance results by employee_id
            const mapping = {};
            attRes.data.forEach(att => {
                mapping[att.employee_id] = {
                    status: att.status,
                    marked_at: att.marked_at,
                    isDirty: false
                };
            });
            setAttendanceData(mapping);

        } catch (error) {
            console.error(error);
            addToast("Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    }, [date, addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleStatusChange = (empId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                status,
                isDirty: true
            }
        }));
    };

    const handleBulkMark = (status) => {
        const newMapping = { ...attendanceData };
        employees.forEach(emp => {
            newMapping[emp.employee_id] = {
                ...newMapping[emp.employee_id],
                status,
                isDirty: true
            };
        });
        setAttendanceData(newMapping);
        addToast(`Marked all as ${status}`, "info");
    };

    const handleSaveAll = async () => {
        const dirtyEntries = Object.entries(attendanceData).filter(([_, data]) => data.isDirty);

        if (dirtyEntries.length === 0) {
            addToast("No changes to save", "info");
            return;
        }

        setSaving(true);
        try {
            const promises = dirtyEntries.map(([empId, data]) =>
                markAttendance({
                    employee_id: empId,
                    date,
                    status: data.status
                })
            );

            await Promise.all(promises);
            addToast(`Successfully updated ${dirtyEntries.length} records!`, "success");
            loadData(); // Reload to get fresh timestamps from server
        } catch (error) {
            console.error(error);
            addToast("Failed to save some attendance records", "error");
        } finally {
            setSaving(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (isoString) => {
        if (!isoString) return null;
        try {
            return format(new Date(isoString), 'hh:mm a');
        } catch (e) {
            return null;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                    <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                        <Calendar size={20} className="text-primary" />
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="bg-transparent border-none focus:outline-none font-bold text-primary dark:text-indigo-300 text-sm cursor-pointer"
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-2.5 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find employee..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all text-sm dark:text-slate-200"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => handleBulkMark('Present')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 transition-all font-semibold text-sm"
                        >
                            Mark All Present
                        </button>
                        <button
                            onClick={() => handleBulkMark('Absent')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800 hover:bg-rose-100 transition-all font-semibold text-sm"
                        >
                            Mark All Absent
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={saving || loading}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 hover:bg-indigo-600 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm"
                        >
                            {saving ? 'Saving...' : <><Save size={18} /> Save All</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="p-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Employee</th>
                                <th className="p-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Department</th>
                                <th className="p-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-center">Status</th>
                                <th className="p-6 font-semibold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right pr-10">Log / Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-6 flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <Skeleton className="h-4 w-32" />
                                        </td>
                                        <td className="p-6"><Skeleton className="h-4 w-24" /></td>
                                        <td className="p-6"><div className="flex justify-center"><Skeleton className="h-10 w-48 rounded-xl" /></div></td>
                                        <td className="p-6"><Skeleton className="h-4 w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-16 text-center text-slate-400 dark:text-slate-500">
                                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="text-lg font-medium">No employees found.</p>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredEmployees.map((emp, idx) => {
                                        const state = attendanceData[emp.employee_id] || {};
                                        return (
                                            <motion.tr
                                                key={emp.employee_id || idx}
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-50 dark:border-slate-800"
                                            >
                                                <td className="p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-primary dark:text-indigo-200 flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110">
                                                            {emp.full_name?.charAt(0) || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-700 dark:text-slate-200 leading-tight">{emp.full_name || 'Generic Node'}</p>
                                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-tighter mt-0.5">{emp.employee_id || 'PENDING'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200/50 dark:border-slate-700">
                                                        {emp.department || 'Unassigned'}
                                                    </span>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(emp.employee_id, 'Present')}
                                                            className={`flex-1 max-w-[110px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all font-bold text-xs ${state.status === 'Present'
                                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20 scale-105'
                                                                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                                                                }`}
                                                        >
                                                            <CheckCircle size={14} />
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(emp.employee_id, 'Absent')}
                                                            className={`flex-1 max-w-[110px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl border transition-all font-bold text-xs ${state.status === 'Absent'
                                                                ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20 scale-105'
                                                                : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-rose-300'
                                                                }`}
                                                        >
                                                            <XCircle size={14} />
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right pr-10">
                                                    {state.isDirty ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg animate-pulse">
                                                            <Clock size={12} /> Pending Save
                                                        </span>
                                                    ) : state.marked_at ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                                                <Check size={12} className="text-emerald-500" /> Marked
                                                            </span>
                                                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">
                                                                {formatTime(state.marked_at)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] font-semibold text-slate-300 dark:text-slate-700 italic">Not marked</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-center flex-col items-center gap-2">
                <p className="text-slate-400 dark:text-slate-500 text-[10px] flex items-center gap-2 font-medium">
                    <Save size={12} /> Changes are only saved permanently after clicking the
                    <span className="text-primary font-bold">"Save All"</span> button.
                </p>
                <div className="h-1 w-24 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
        </div>
    );
};

export default Attendance;
