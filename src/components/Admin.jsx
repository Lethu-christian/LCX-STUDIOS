import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
    Users,
    Globe,
    Shield,
    Search,
    MoreVertical,
    ArrowLeft,
    LogOut,
    LayoutDashboard,
    ExternalLink,
    Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [sites, setSites] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminStatus();
    }, []);

    async function checkAdminStatus() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data: profile, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .single();

            if (error || !profile?.is_admin) {
                navigate('/');
                return;
            }

            setIsAdmin(true);
            fetchData();
        } catch (error) {
            console.error('Error checking admin status:', error);
            navigate('/');
        }
    }

    async function fetchData() {
        setLoading(true);
        try {
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('*')
                .order('updated_at', { ascending: false });

            const { data: sitesData } = await supabase
                .from('sites')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false });

            setProfiles(profilesData || []);
            setSites(sitesData || []);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProfiles = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-white text-slate-950">
            {/* Sidebar / Header Nav */}
            <div className="bg-slate-950 text-white p-6 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Control Center</div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                            <Shield size={14} />
                            Verified Admin
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        icon={<Users className="text-blue-500" />}
                        label="Total Users"
                        value={profiles.length}
                    />
                    <StatCard
                        icon={<Globe className="text-cyan-500" />}
                        label="Site Requests"
                        value={sites.length}
                    />
                    <StatCard
                        icon={<LayoutDashboard className="text-purple-500" />}
                        label="System Status"
                        value="Operational"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* User Management */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Users size={20} className="text-blue-500" />
                                User Directory
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400">Loading users...</td></tr>
                                        ) : filteredProfiles.map(profile => (
                                            <tr key={profile.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
                                                            {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" /> : <Users size={18} />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">{profile.full_name || 'Anonymous User'}</div>
                                                            <div className="text-xs text-slate-500">@{profile.username || 'no-username'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                        profile.is_admin ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                                                    )}>
                                                        {profile.is_admin ? 'Admin' : 'Client'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-slate-400">
                                                    <button className="hover:text-slate-950"><MoreVertical size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Site Tracking */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Globe size={20} className="text-cyan-500" />
                            Tracking (Future Sites)
                        </h3>
                        <div className="space-y-4">
                            {sites.length === 0 ? (
                                <div className="p-8 rounded-3xl border border-dashed border-slate-200 text-center">
                                    <Globe size={32} className="mx-auto mb-4 text-slate-200" />
                                    <p className="text-sm text-slate-400">No sites tracked yet.</p>
                                </div>
                            ) : sites.map(site => (
                                <div key={site.id} className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center">
                                            <Globe size={20} />
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                            site.status === 'live' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                                        )}>
                                            {site.status}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-950 mb-1">{site.name}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                                        <Users size={12} />
                                        Owner: {site.profiles?.full_name || 'Unknown'}
                                    </p>
                                    {site.url && (
                                        <a href={site.url} target="_blank" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                            Visit Site <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="p-8 rounded-[2.5rem] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                    {icon}
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{label}</div>
            </div>
            <div className="text-4xl font-black text-slate-950 tracking-tight">{value}</div>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
