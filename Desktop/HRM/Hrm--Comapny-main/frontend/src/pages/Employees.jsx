import React, { useEffect, useState, useMemo } from 'react';
import { getEmployees, addEmployee, deleteEmployee } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/Skeleton';
import { Search, Plus, Trash2, Filter, Download, UserPlus, Users, X, ChevronLeft, ChevronRight, Eye, Mail, IdCard } from 'lucide-react';
import EmployeeDetailPanel from '../components/EmployeeDetailPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [form, setForm] = useState({
        employee_id: '',
        full_name: '',
        email: '',
        department: 'Engineering'
    });
    const [submitting, setSubmitting] = useState(false);

    const { addToast } = useToast();
    const departments = ['All', 'Engineering', 'Marketing', 'Sales', 'HR', 'Design', 'Support'];

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const { data } = await getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error(err);
            addToast("Failed to load employees", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        // client-side validations and dedup
        const trimmed = {
            employee_id: form.employee_id.trim(),
            full_name: form.full_name.trim(),
            email: form.email.trim(),
            department: form.department
        };

        if (!trimmed.employee_id || !trimmed.full_name || !trimmed.email) {
            addToast('Please fill all required fields', 'error');
            return;
        }

        // simple duplicate check against loaded list
        if (employees.some(emp => emp.employee_id === trimmed.employee_id)) {
            addToast('Employee ID already exists locally', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await addEmployee(trimmed);
            addToast("Employee added successfully!", "success");
            setShowModal(false);
            setForm({ employee_id: '', full_name: '', email: '', department: 'Engineering' });
            await fetchEmployees();
        } catch (err) {
            addToast(err.response?.data?.detail || "Failed to add employee", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this employee and their history?")) {
            try {
                await deleteEmployee(id);
                addToast("Employee deleted!", "info");
                fetchEmployees();
            } catch (err) {
                addToast("Delete failed", "error");
            }
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Primary color
        doc.text("Organization Node Registry", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 30);

        const tableColumn = ["Employee ID", "Full Name", "Email", "Department"];
        const tableRows = filteredEmployees.map(emp => [
            emp.employee_id,
            emp.full_name,
            emp.email,
            emp.department
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center'
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 9, cellPadding: 5 }
        });

        doc.save(`employees_report_${format(new Date(), 'yyyyMMdd')}.pdf`);
        addToast("Synthesizing PDF Intelligence...", "success");
    };

    const exportToCSV = () => {
        const headers = ["Employee ID,Full Name,Email,Department"];
        const rows = employees.map(emp => `${emp.employee_id},${emp.full_name},${emp.email},${emp.department}`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `employees_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        addToast("Exporting to CSV...", "info");
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                emp.employee_id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
            return matchesSearch && matchesDept;
        });
    }, [employees, searchQuery, selectedDept]);

    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getDeptColor = (dept) => {
        switch (dept) {
            case 'Engineering': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Marketing': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Design': return 'bg-pink-50 text-pink-600 border-pink-100';
            case 'Sales': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'HR': return 'bg-teal-50 text-teal-600 border-teal-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all dark:text-slate-200 shadow-sm"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="pl-10 pr-8 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer text-sm font-semibold text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                        >
                            {departments.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={exportToPDF}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                    >
                        <Download size={18} /> Export PDF
                    </motion.button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex-[1.5] lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-indigo-600 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                        <Plus size={20} /> Add Employee
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-[0.1em]">Employee Details</th>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-[0.1em]">Department</th>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-[0.1em]">Status</th>
                                <th className="p-6 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-[0.1em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <Skeleton className="h-12 w-12 rounded-2xl" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-48" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6"><Skeleton className="h-8 w-24 rounded-lg" /></td>
                                        <td className="p-6"><Skeleton className="h-4 w-16" /></td>
                                        <td className="p-6 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                                <Users size={48} className="text-slate-200 dark:text-slate-700" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-bold text-slate-800 dark:text-white">No employees found</p>
                                                <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {paginatedEmployees.map((emp, idx) => (
                                        <motion.tr
                                            key={emp.employee_id || idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-pointer border-b border-slate-50 dark:border-slate-800"
                                            onClick={() => {
                                                setSelectedEmployee(emp);
                                                setIsPanelOpen(true);
                                            }}
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 flex items-center justify-center font-black text-primary shadow-inner">
                                                        {emp.full_name?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-primary transition-colors">
                                                            {emp.full_name || 'Anonymous Node'}
                                                        </p>
                                                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                                                            <Mail size={12} /> {emp.email || 'N/A'}
                                                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                            <IdCard size={12} /> {emp.employee_id || 'ID-PENDING'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`px-4 py-1.5 rounded-xl text-xs font-black border ${getDeptColor(emp.department)}`}>
                                                    {emp.department || 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-sm">
                                                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                    Active
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-colors"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(emp.employee_id);
                                                        }}
                                                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="p-6 border-t border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                    <p className="text-sm font-bold text-slate-400">
                        Showing <span className="text-slate-700 dark:text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-700 dark:text-slate-300">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="text-slate-700 dark:text-slate-300">{filteredEmployees.length}</span> employees
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${currentPage === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals & Panels */}
            <EmployeeDetailPanel
                employee={selectedEmployee}
                isOpen={isPanelOpen}
                onClose={() => setIsPanelOpen(false)}
            />

            {/* Add Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/10">
                        <div className="p-8 pb-0 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                    <UserPlus size={24} />
                                </div>
                                New Employee
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAdd} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Employee ID</label>
                                    <input
                                        required
                                        placeholder="e.g. EMP-101"
                                        className="w-full px-5 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:ring-primary/20 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all dark:text-white font-semibold"
                                        value={form.employee_id}
                                        onChange={e => setForm({ ...form, employee_id: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all dark:text-white font-semibold appearance-none cursor-pointer"
                                        value={form.department}
                                        onChange={e => setForm({ ...form, department: e.target.value })}
                                    >
                                        {departments.filter(d => d !== 'All').map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                <input
                                    required
                                    placeholder="e.g. John Doe"
                                    className="w-full px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all dark:text-white font-semibold"
                                    value={form.full_name}
                                    onChange={e => setForm({ ...form, full_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="e.g. john@company.com"
                                    className="w-full px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary focus:outline-none transition-all dark:text-white font-semibold"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`flex-[2] py-4 rounded-3xl bg-primary text-white font-black shadow-xl shadow-primary/30 hover:bg-indigo-600 hover:shadow-primary/40 hover:-translate-y-1 transition-all ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? 'Creating…' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
