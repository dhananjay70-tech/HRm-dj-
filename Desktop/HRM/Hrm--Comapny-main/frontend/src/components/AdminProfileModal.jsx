import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Mail, Shield, Smartphone, MapPin, LogOut, Save, Edit2, CheckCircle } from 'lucide-react';

const AdminProfileModal = ({ isOpen, onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [adminData, setAdminData] = useState({
        name: 'Rishav Kumar',
        role: 'Super Admin',
        email: 'admin@hrmslite.com',
        phone: '+91 98765 43210',
        location: 'New Delhi, India',
        avatar: null
    });

    // Load data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('adminProfile');
        if (savedData) {
            try {
                setAdminData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse saved profile", e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('adminProfile', JSON.stringify(adminData));
        setIsEditing(false);
        // Dispatch custom event to notify Header/other components
        window.dispatchEvent(new Event('adminProfileUpdated'));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newData = { ...adminData, avatar: reader.result };
                setAdminData(newData);
                localStorage.setItem('adminProfile', JSON.stringify(newData));
                window.dispatchEvent(new Event('adminProfileUpdated'));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (field, value) => {
        setAdminData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-center items-start p-4 overflow-y-auto pb-20 pt-10 sm:pt-20">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isEditing && onClose()}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden z-[101]"
                    >
                        {/* Header Image/Gradient */}
                        <div className="h-32 bg-gradient-to-r from-primary via-indigo-600 to-purple-600"></div>

                        {!isEditing && (
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all z-10"
                            >
                                <X size={20} />
                            </button>
                        )}

                        <div className="px-8 pb-8">
                            {/* Avatar Section */}
                            <div className="relative -mt-14 mb-4 flex justify-center">
                                <div className="relative group">
                                    <div className="h-28 w-28 rounded-[1.8rem] bg-white dark:bg-slate-800 p-1.5 shadow-2xl">
                                        <div className="h-full w-full rounded-[1.5rem] bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center border-2 border-primary/20">
                                            {adminData.avatar ? (
                                                <img src={adminData.avatar} alt="Admin" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-4xl font-black text-primary">
                                                    {adminData.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <label className="absolute bottom-2 right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                                        <Camera size={18} />
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="text-center mb-6">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={adminData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="text-2xl font-black text-center text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-800 border-2 border-primary/20 rounded-xl px-4 py-2 w-full outline-none focus:border-primary transition-all"
                                    />
                                ) : (
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                        {adminData.name}
                                    </h3>
                                )}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                    <Shield size={10} /> {adminData.role}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <ProfileItem
                                        icon={Mail}
                                        label="Email Address"
                                        value={adminData.email}
                                        isEditing={isEditing}
                                        onChange={(val) => handleChange('email', val)}
                                    />
                                    <ProfileItem
                                        icon={Smartphone}
                                        label="Phone Number"
                                        value={adminData.phone}
                                        isEditing={isEditing}
                                        onChange={(val) => handleChange('phone', val)}
                                    />
                                    <ProfileItem
                                        icon={MapPin}
                                        label="Location"
                                        value={adminData.location}
                                        isEditing={isEditing}
                                        onChange={(val) => handleChange('location', val)}
                                    />
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3 mb-1">
                                            <Shield size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-6 mt-1">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Encrypted / Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/50 flex gap-3">
                                {isEditing ? (
                                    <div className="flex-1 flex gap-2">
                                        <button
                                            onClick={handleSave}
                                            className="flex-1 py-4 px-6 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                        >
                                            <Save size={20} /> Save
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold hover:bg-slate-200 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-4 px-6 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={18} /> Edit Profile
                                    </button>
                                )}
                                <button className="flex items-center justify-center p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const ProfileItem = ({ icon: Icon, label, value, isEditing, onChange }) => (
    <div className={`p-4 rounded-2xl transition-all group ${isEditing ? 'bg-white dark:bg-slate-800 border-2 border-primary/20 ring-4 ring-primary/5' : 'bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700'}`}>
        <div className="flex items-center gap-3 mb-1">
            <Icon size={14} className={`${isEditing ? 'text-primary' : 'text-slate-400 group-hover:text-primary'} transition-colors`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        {isEditing ? (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent text-sm font-bold text-slate-800 dark:text-white outline-none pl-6"
            />
        ) : (
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 pl-6">{value}</p>
        )}
    </div>
);

export default AdminProfileModal;
