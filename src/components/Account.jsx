import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { User, Mail, Shield, LogOut, Settings, Calendar, RefreshCcw, ArrowLeft } from 'lucide-react';

const Account = ({ session, onSignOut, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        getProfile();
    }, [session]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const { user } = session;

            // Get user metadata (like name from Google)
            const metadata = user.user_metadata || {};

            setProfile({
                email: user.email,
                name: metadata.full_name || metadata.name || 'LCX Client',
                avatar: metadata.avatar_url || metadata.picture,
                lastSignIn: new Date(user.last_sign_in_at).toLocaleDateString(),
                joined: new Date(user.created_at).toLocaleDateString(),
            });
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (!error) onSignOut?.();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <RefreshCcw className="text-blue-500 animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {/* Left Column: Profile Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="p-8 rounded-3xl bg-slate-950 border border-white/10 text-center shadow-xl">
                            <div className="relative inline-block mb-6">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt="Avatar"
                                        className="w-32 h-32 rounded-full border-4 border-blue-600/30 object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-blue-500/10 border-4 border-blue-500/30 flex items-center justify-center text-blue-400">
                                        <User size={48} />
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 p-2 rounded-full bg-blue-600 border-2 border-slate-950 text-white">
                                    <Shield size={16} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>
                            <p className="text-slate-400 text-sm mb-6 flex items-center justify-center gap-2">
                                <Mail size={14} />
                                {profile.email}
                            </p>

                            <button
                                onClick={handleSignOut}
                                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                            >
                                <LogOut size={18} />
                                Log Out
                            </button>
                        </div>
                        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                            <h3 className="text-slate-950 font-bold mb-4 flex items-center gap-2">
                                <Settings size={18} className="text-blue-500" />
                                Account Info
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-slate-600">
                                    <span>Joined</span>
                                    <span className="text-slate-900">{profile.joined}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Last Login</span>
                                    <span className="text-slate-900">{profile.lastSignIn}</span>
                                </div>
                                <div className="flex justify-between text-slate-600">
                                    <span>Status</span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="p-8 rounded-3xl bg-slate-50/50 border border-slate-200 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-slate-950">Your Orders</h3>
                                <button className="text-blue-400 text-sm hover:underline">View All</button>
                            </div>

                            <div className="text-center py-12 px-6 rounded-2xl bg-slate-100 border border-dashed border-slate-200 text-slate-500">
                                <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg">No active orders yet.</p>
                                <p className="text-sm mt-2">Projects you start will appear here for tracking.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-left hover:bg-slate-200 transition-all">
                                <h4 className="text-slate-950 font-bold mb-1">Billing History</h4>
                                <p className="text-slate-600 text-xs">Manage your invoices</p>
                            </button>
                            <button className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-left hover:bg-slate-200 transition-all">
                                <h4 className="text-slate-950 font-bold mb-1">Project Files</h4>
                                <p className="text-slate-600 text-xs">Access your deliverables</p>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <button
                    onClick={onBack}
                    className="mt-12 inline-flex items-center gap-2 text-slate-600 hover:text-slate-950 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Home
                </button>
            </div>
        </div>
    );
};

export default Account;
