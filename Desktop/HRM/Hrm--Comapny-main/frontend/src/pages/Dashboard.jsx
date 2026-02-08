import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, TrendingUp, Calendar, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getStats, getWeeklyStats, getRecentActivity } from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import FloatingActionPanel from '../components/FloatingActionPanel';

const KPICard = ({ title, value, icon: Icon, trend, trendValue, loading, color }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
            <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                {loading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${color} text-white`}>
                <Icon size={20} />
            </div>
        </div>

        {trend !== undefined && (
            <div className="flex items-center gap-2">
                {trend > 0 ? (
                    <>
                        <ArrowUpRight size={16} className="text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{trendValue}% up</span>
                    </>
                ) : (
                    <>
                        <ArrowDownRight size={16} className="text-rose-500" />
                        <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">{Math.abs(trendValue)}% down</span>
                    </>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
            </div>
        )}
    </div>
);

const ChartBar = ({ label, value, maxValue = 100, color = 'bg-indigo-600' }) => {
    const percentage = (value / maxValue) * 100;
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                <span className="text-xs font-black text-slate-600 dark:text-slate-300">{value}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [stats, setStats] = useState({ total_employees: 0, present_today: 0, absent_today: 0 });
    const [weeklyData, setWeeklyData] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [statsRes, weeklyRes, recentRes] = await Promise.all([
                getStats(),
                getWeeklyStats(),
                getRecentActivity()
            ]);
            setStats(statsRes.data);
            setWeeklyData(weeklyRes.data || []);
            setRecentActivity(recentRes.data || []);
        } catch (err) {
            console.error('Failed to load stats', err);
        } finally {
            setLoading(false);
        }
    };

    const attendanceRate = stats.total_employees > 0
        ? Math.round((stats.present_today / stats.total_employees) * 100)
        : 0;

    const weeklyAvg = weeklyData.length > 0
        ? Math.round(weeklyData.reduce((sum, d) => sum + (d.present || 0), 0) / weeklyData.length)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <FloatingActionPanel />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-2">Dashboard</h1>
                    <p className="text-slate-600 dark:text-slate-400">Welcome back! Here's your workforce overview.</p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <KPICard
                        title="Total Employees"
                        value={stats.total_employees}
                        icon={Users}
                        trend={1}
                        trendValue={2}
                        loading={loading}
                        color="bg-indigo-600"
                    />
                    <KPICard
                        title="Present Today"
                        value={stats.present_today}
                        icon={UserCheck}
                        trend={1}
                        trendValue={5}
                        loading={loading}
                        color="bg-emerald-600"
                    />
                    <KPICard
                        title="Absent Today"
                        value={stats.absent_today}
                        icon={UserX}
                        trend={-1}
                        trendValue={3}
                        loading={loading}
                        color="bg-rose-600"
                    />
                    <KPICard
                        title="Attendance Rate"
                        value={`${attendanceRate}%`}
                        icon={Activity}
                        trend={1}
                        trendValue={2}
                        loading={loading}
                        color="bg-amber-600"
                    />
                </div>

                {/* Charts & Analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Attendance Trend Chart */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                <TrendingUp size={20} className="text-indigo-600" />
                                Weekly Attendance Trend
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Employee attendance over the last 7 days</p>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {Array(7).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {(weeklyData.length > 0 ? weeklyData : [
                                    { day: 'Monday', present: 0 },
                                    { day: 'Tuesday', present: 0 },
                                    { day: 'Wednesday', present: 0 },
                                    { day: 'Thursday', present: 0 },
                                    { day: 'Friday', present: 0 },
                                    { day: 'Saturday', present: 0 },
                                    { day: 'Sunday', present: 0 },
                                ]).map((item, i) => (
                                    <ChartBar
                                        key={i}
                                        label={item.day || `Day ${i + 1}`}
                                        value={item.present || 0}
                                        maxValue={stats.total_employees || 100}
                                        color="bg-indigo-500"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Chart Legend */}
                        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Present</span>
                            </div>
                            <span className="text-lg font-black text-slate-900 dark:text-white">{weeklyAvg}% Avg</span>
                        </div>
                    </div>

                    {/* Employee Growth */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8">Employee Distribution</h3>

                        {loading ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex justify-between mb-3">
                                        <span className="font-semibold text-slate-900 dark:text-white">Active</span>
                                        <span className="font-black text-indigo-600">{Math.round(stats.total_employees * 0.85)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: '85%' }} />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex justify-between mb-3">
                                        <span className="font-semibold text-slate-900 dark:text-white">On Leave</span>
                                        <span className="font-black text-amber-600">{Math.round(stats.total_employees * 0.1)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: '10%' }} />
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <div className="flex justify-between mb-3">
                                        <span className="font-semibold text-slate-900 dark:text-white">Inactive</span>
                                        <span className="font-black text-rose-600">{Math.round(stats.total_employees * 0.05)}</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: '5%' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Section */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                            <Activity size={20} className="text-emerald-600" />
                            Recent Activity
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Latest updates from your organization</p>
                    </div>

                    {loading ? (
                        <div className="space-y-4">
                            {Array(5).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? (
                                recentActivity.slice(0, 8).map((activity, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-white ${
                                            activity.color || 'bg-slate-400'
                                        }`}>
                                            {activity.initial}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{activity.user}</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400">{activity.action}</p>
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{activity.time}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Activity size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                                    <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
