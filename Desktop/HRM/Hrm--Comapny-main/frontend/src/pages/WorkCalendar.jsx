import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, getAttendanceByDate } from '../services/api';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter, Users } from 'lucide-react';

const WorkCalendar = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState({}); // { dateStr: { empId: status } }
    const [loading, setLoading] = useState(true);
    const [selectedDept, setSelectedDept] = useState('All');

    const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Support'];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchMonthAttendance();
    }, [currentMonth]);

    const fetchInitialData = async () => {
        try {
            const { data } = await getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMonthAttendance = async () => {
        setLoading(true);
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        const newAttendance = {};
        try {
            const promises = days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return getAttendanceByDate(dateStr).then(res => ({ dateStr, data: res.data }));
            });

            const results = await Promise.all(promises);
            results.forEach(({ dateStr, data }) => {
                newAttendance[dateStr] = {};
                data.forEach(att => {
                    newAttendance[dateStr][att.employee_id] = att.status;
                });
            });
            setAttendanceData(newAttendance);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const filteredEmployees = useMemo(() => {
        return employees.filter(e => selectedDept === 'All' || e.department === selectedDept);
    }, [employees, selectedDept]);

    const getDayStats = (day) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayAtt = attendanceData[dateStr] || {};
        const relevantIds = filteredEmployees.map(e => e.employee_id);

        let present = 0;
        let absent = 0;

        relevantIds.forEach(id => {
            if (dayAtt[id] === 'Present') present++;
            else if (dayAtt[id] === 'Absent') absent++;
        });

        return { present, absent };
    };

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center gap-2 sm:gap-6 w-full justify-between sm:justify-start">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                    >
                        <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <div className="px-2 sm:px-4 text-center min-w-[120px] sm:min-w-[160px]">
                        <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-none">{format(currentMonth, 'MMMM')}</h2>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{format(currentMonth, 'yyyy')}</p>
                    </div>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 sm:p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 transition-all active:scale-95"
                    >
                        <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none min-w-0">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full md:w-44 pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                        >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="hidden sm:flex flex-col items-end min-w-fit">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Team Size</p>
                        <p className="text-base font-black text-primary flex items-center gap-1.5">
                            <Users size={16} /> {filteredEmployees.length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-4 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 transition-colors overflow-hidden">
                {/* Week Header */}
                <div className="grid grid-cols-7 mb-2 sm:mb-4">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-center py-2 text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                            <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
                            <span className="sm:hidden">{d}</span>
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-4">
                    {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDay = isToday(day);
                        const stats = getDayStats(day);
                        const hasData = stats.present > 0 || stats.absent > 0;
                        const presentPercentage = hasData ? (stats.present / (stats.present + stats.absent)) * 100 : 0;

                        return (
                            <div
                                key={idx}
                                className={`relative min-h-[70px] sm:min-h-[100px] lg:min-h-[140px] p-1.5 sm:p-3 rounded-xl sm:rounded-3xl border transition-all flex flex-col justify-between ${!isCurrentMonth
                                    ? 'bg-slate-50/30 dark:bg-slate-900/30 border-transparent opacity-10'
                                    : isTodayDay
                                        ? 'bg-indigo-50/50 dark:bg-primary/10 border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={`text-base sm:text-lg font-black ${isTodayDay ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                                        {format(day, 'd')}
                                    </span>
                                    {isTodayDay && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary sm:hidden" />
                                    )}
                                    {isTodayDay && (
                                        <span className="hidden sm:inline-block p-1 rounded-lg bg-primary text-white text-[8px] font-black uppercase tracking-tighter">
                                            Today
                                        </span>
                                    )}
                                </div>

                                {isCurrentMonth && (
                                    <div className="mt-1">
                                        {loading ? (
                                            <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                                        ) : hasData ? (
                                            <div className="space-y-1">
                                                <div className="hidden sm:flex justify-between text-[9px] font-bold">
                                                    <span className="text-emerald-500">{stats.present}P</span>
                                                    <span className="text-slate-400">{stats.absent}A</span>
                                                </div>
                                                <div className="h-1 sm:h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                                        style={{ width: `${presentPercentage}%` }}
                                                    />
                                                    <div className="flex-1 bg-rose-500/30" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-1 sm:h-4 sm:flex items-center justify-center opacity-0 sm:opacity-100">
                                                <p className="text-[10px] font-bold text-slate-300 dark:text-slate-700 italic hidden sm:block">No logs</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 py-3 px-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5 w-full sm:w-fit mx-auto shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-rose-500/30" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full border-2 border-primary" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Today</span>
                </div>
            </div>
        </div>
    );
};

export default WorkCalendar;
