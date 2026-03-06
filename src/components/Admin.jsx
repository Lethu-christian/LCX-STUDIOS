import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Globe, Shield, Search, MoreVertical, ArrowLeft,
    LayoutDashboard, ExternalLink, Image as ImageIcon, Plus, Edit2, Trash2, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [sites, setSites] = useState([]);
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [isPinVerified, setIsPinVerified] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // Portfolio Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        category: 'Voting Platform',
        description: '',
        badge: '',
        cover_image: '',
        gallery_images: ''
    });

    useEffect(() => {
        const savedPin = localStorage.getItem('adminPin');
        if (savedPin === '1965') {
            setIsPinVerified(true);
            fetchData();
        }
    }, []);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput === '1965') {
            localStorage.setItem('adminPin', '1965');
            setIsPinVerified(true);
            fetchData();
        } else {
            alert('Incorrect PIN');
            setPinInput('');
        }
    };

    async function fetchData() {
        setLoading(true);
        try {
            const [profilesRes, sitesRes, portfolioRes] = await Promise.all([
                supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
                supabase.from('sites').select('*, profiles(full_name)').order('created_at', { ascending: false }),
                supabase.from('portfolio_items').select('*').order('created_at', { ascending: false })
            ]);

            setProfiles(profilesRes.data || []);
            setSites(sitesRes.data || []);
            setPortfolioItems(portfolioRes.data || []);
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

    // Portfolio Actions
    const handlePortfolioSubmit = async (e) => {
        e.preventDefault();
        const galleryArray = form.gallery_images.split('\n').map(s => s.trim()).filter(s => s !== '');

        const payload = {
            title: form.title,
            category: form.category,
            description: form.description,
            badge: form.badge,
            cover_image: form.cover_image,
            gallery_images: galleryArray
        };

        try {
            if (editingId) {
                await supabase.from('portfolio_items').update(payload).eq('id', editingId);
            } else {
                await supabase.from('portfolio_items').insert([payload]);
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error("Error saving portfolio item:", error);
            alert("Failed to save portfolio item. Ensure you ran the SQL script.");
        }
    };

    const editItem = (item) => {
        setEditingId(item.id);
        setForm({
            title: item.title,
            category: item.category,
            description: item.description || '',
            badge: item.badge || '',
            cover_image: item.cover_image || '',
            gallery_images: (item.gallery_images || []).join('\n')
        });
        setShowModal(true);
    };

    const deleteItem = async (id) => {
        if (!window.confirm("Delete this portfolio item?")) return;
        try {
            await supabase.from('portfolio_items').delete().eq('id', id);
            fetchData();
        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ title: '', category: 'Voting Platform', description: '', badge: '', cover_image: '', gallery_images: '' });
        setShowModal(true);
    };

    if (!isPinVerified) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white text-center">
                <div className="max-w-md w-full bg-slate-900/50 p-10 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Admin Control Center</h1>
                    <p className="text-slate-400 mb-8 text-sm">Please enter the master security PIN to authorize access.</p>
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter PIN"
                            className="w-full text-center tracking-[0.5em] text-2xl font-black bg-[#020617] border border-slate-700 rounded-xl py-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal placeholder:font-normal transition-all"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                            Unlock Dashboard
                        </button>
                    </form>
                    <button onClick={() => navigate('/')} className="mt-8 text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center w-full gap-2">
                        <ArrowLeft size={16} /> Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 sticky top-0 z-40 shadow-xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Control Center</div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        </div>
                    </div>
                    <div className="flex bg-slate-900/10 p-1 rounded-2xl overflow-x-auto no-scrollbar max-w-full">
                        <button
                            className={cn("whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'overview' ? "bg-blue-600 text-white" : "text-white/60 hover:text-white")}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button
                            className={cn("whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'portfolio' ? "bg-blue-600 text-white" : "text-white/60 hover:text-white")}
                            onClick={() => setActiveTab('portfolio')}
                        >
                            Portfolio Manager
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6 md:p-10">
                {activeTab === 'overview' ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <StatCard icon={<Users className="text-blue-500" />} label="Total Users" value={profiles.length} />
                            <StatCard icon={<Globe className="text-cyan-500" />} label="Site Requests" value={sites.length} />
                            <StatCard icon={<LayoutDashboard className="text-purple-500" />} label="System Status" value="Operational" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* User Management */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        <Users size={20} className="text-blue-500" /> User Directory
                                    </h3>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text" placeholder="Search users..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-600 bg-slate-900 text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm"
                                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-3xl border border-slate-600 overflow-hidden shadow-sm overflow-x-auto">
                                    <table className="w-full text-left min-w-[600px]">
                                        <thead className="bg-[#020617] border-b border-slate-600">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/5">
                                            {loading ? <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400">Loading...</td></tr> :
                                                filteredProfiles.map(profile => (
                                                    <tr key={profile.id} className="hover:bg-[#020617]/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-600 overflow-hidden shrink-0">
                                                                    {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" /> : <Users size={18} />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-white truncate">{profile.full_name || 'Anonymous User'}</div>
                                                                    <div className="text-xs text-slate-400 truncate">@{profile.username || 'no-username'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", profile.is_admin ? "bg-blue-900/40 text-blue-400 border border-blue-500/20" : "bg-slate-900 text-slate-400 border border-slate-700")}>
                                                                {profile.is_admin ? 'Admin' : 'Client'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right text-slate-400">
                                                            <button className="hover:text-white p-2"><MoreVertical size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Site Tracking */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Globe size={20} className="text-cyan-500" /> Tracking (Sites)
                                </h3>
                                <div className="space-y-4">
                                    {sites.length === 0 ? (
                                        <div className="p-8 rounded-3xl border border-dashed border-slate-500 text-center text-slate-400">
                                            <Globe size={32} className="mx-auto mb-4 text-slate-200" /> No sites tracked yet.
                                        </div>
                                    ) : sites.map(site => (
                                        <div key={site.id} className="p-6 rounded-3xl border border-slate-600 bg-slate-900 shadow-sm hover:shadow-md transition-all">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-500 flex items-center justify-center"><Globe size={20} /></div>
                                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", site.status === 'live' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600")}>
                                                    {site.status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-white mb-1">{site.name}</h4>
                                            <p className="text-xs text-slate-400 flex items-center gap-1 mb-4"><Users size={12} /> Owner: {site.profiles?.full_name || 'Unknown'}</p>
                                            {site.url && <a href={site.url} target="_blank" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">Visit Site <ExternalLink size={12} /></a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                                <ImageIcon className="text-blue-500" /> Portfolio Content Manager
                            </h2>
                            <button
                                onClick={openCreateModal}
                                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                            >
                                <Plus size={18} /> Add New Item
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {portfolioItems.length === 0 && !loading && (
                                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-600 rounded-[3rem]">
                                    <ImageIcon size={48} className="mx-auto mb-4 text-slate-300" />
                                    <h3 className="text-xl font-bold text-white mb-2">No portfolio items</h3>
                                    <p className="text-slate-400 mb-6">Create your first portfolio item to display it on the main site.</p>
                                    <button onClick={openCreateModal} className="text-blue-600 font-bold hover:underline">Create Item</button>
                                </div>
                            )}

                            {portfolioItems.map(item => (
                                <div key={item.id} className="bg-slate-900 rounded-3xl border border-slate-600 overflow-hidden shadow-sm group">
                                    <div className="aspect-[4/3] relative bg-slate-900">
                                        {item.cover_image ? (
                                            <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={48} /></div>
                                        )}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-white mb-2 truncate">{item.title}</h3>
                                        <p className="text-sm text-slate-400 line-clamp-2 mb-6">{item.description}</p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => editItem(item)}
                                                className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-slate-300 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                                            >
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                className="flex items-center justify-center p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-slate-600"
                        >
                            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-700 bg-[#020617]/50">
                                <h3 className="text-2xl font-bold text-white">
                                    {editingId ? 'Edit Portfolio Item' : 'New Portfolio Item'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-300 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handlePortfolioSubmit} className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Title</label>
                                        <input required className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-[#020617] focus:border-blue-500 focus:outline-none"
                                            value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Miss Qhawekazi Voting Platform" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Category</label>
                                        <select required className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-[#020617] focus:border-blue-500 focus:outline-none"
                                            value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option>Voting Platform</option>
                                            <option>Internal Business System</option>
                                            <option>Poster Design</option>
                                            <option>Logo Design</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</label>
                                    <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-[#020617] focus:border-blue-500 focus:outline-none resize-none"
                                        value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the work..." />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Badge text (Optional)</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-[#020617] focus:border-blue-500 focus:outline-none"
                                            value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="e.g. Featured SaaS" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Cover Image URL</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-[#020617] focus:border-blue-500 focus:outline-none"
                                            value={form.cover_image} onChange={e => setForm({ ...form, cover_image: e.target.value })} placeholder="https://..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Gallery Images (URLs, one per line)</label>
                                    <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-[#020617] focus:border-blue-500 focus:outline-none resize-none placeholder:text-slate-400 font-mono text-sm leading-relaxed whitespace-pre"
                                        value={form.gallery_images} onChange={e => setForm({ ...form, gallery_images: e.target.value })}
                                        placeholder="https://image1.com/img.jpg&#10;https://image2.com/img.jpg" />
                                </div>

                                <div className="pt-4 border-t border-slate-700 flex justify-end gap-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-500 transition-colors active:scale-95">Save Item</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="p-8 rounded-[2.5rem] border border-slate-600 bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#020617] flex items-center justify-center">
                    {icon}
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">{value}</div>
        </div>
    );
}

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
