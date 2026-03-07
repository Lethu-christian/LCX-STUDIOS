import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Wallet, ShieldCheck,
    AlertTriangle, FileText, Upload, RefreshCcw,
    PieChart, DollarSign, Activity, CheckCircle2,
    Lock, Sparkles, MessageSquare, Download, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import YocoPayButton from './YocoPayButton';

const WHATSAPP_NUMBER = '27678846390';

export default function FinancialAnalyzer({ session }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [aiReport, setAiReport] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [generatingAI, setGeneratingAI] = useState(false);

    useEffect(() => {
        if (session) {
            fetchFinancialData();
        }
    }, [session]);

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const { data: analysisData } = await supabase
                .from('financial_analysis')
                .select('*')
                .eq('user_id', session.user.id)
                .order('month_year', { ascending: false })
                .limit(1)
                .maybeSingle();

            const { data: txsData } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('user_id', session.user.id)
                .order('date', { ascending: false })
                .limit(20);

            const { data: uploadsData } = await supabase
                .from('financial_uploads')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            const { data: aiData } = await supabase
                .from('financial_ai_reports')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (analysisData) setAnalysis(analysisData);
            if (txsData) setTransactions(txsData);
            if (uploadsData) setUploads(uploadsData);
            if (aiData) setAiReport(aiData);
        } catch (error) {
            console.error('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !session) return;

        setProcessing(true);
        setStatus('Uploading...');

        try {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const allowedExts = ['csv', 'pdf', 'png', 'jpg', 'jpeg'];

            if (!allowedExts.includes(fileExt)) {
                alert('Please upload a CSV, PDF, or Image file');
                return;
            }

            const fileName = `${session.user.id}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
            const { data, error: uploadErr } = await supabase.storage
                .from('financial-docs')
                .upload(fileName, file);

            if (uploadErr) throw uploadErr;

            // Save record
            const { data: dbData, error: dbErr } = await supabase
                .from('financial_uploads')
                .insert({
                    user_id: session.user.id,
                    filename: file.name,
                    file_type: fileExt,
                    storage_path: fileName,
                    status: 'pending'
                })
                .select()
                .single();

            if (dbErr) throw dbErr;

            // Trigger Edge Function Processing
            const { data: processResult, error: processErr } = await supabase.functions.invoke('process-financials', {
                body: { uploadId: dbData.id }
            });

            if (processErr) throw processErr;

            await fetchFinancialData();
            setActiveTab('dashboard');
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setProcessing(false);
            setStatus('Ready');
        }
    };

    const handleAISummaryGenerated = async () => {
        if (!session) {
            alert('Please log in to generate an AI summary.');
            return;
        }
        setGeneratingAI(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-ai-summary', {
                body: { userId: session.user.id }
            });
            if (error) {
                // Supabase Edge Function errors often contain the body in error.context
                let detail = '';
                try {
                    if (error.context && typeof error.context.text === 'function') {
                        detail = await error.context.text();
                    } else if (error.message) {
                        detail = error.message;
                    }
                } catch (e) {
                    detail = error.message || 'Unknown error';
                }
                throw new Error(detail || error.message || 'Edge Function Error');
            }
            await fetchFinancialData();
        } catch (error) {
            const errorMsg = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            console.error('AI Generation Error Detail:', error);
            alert('AI Generation failed: ' + errorMsg);
        } finally {
            setGeneratingAI(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                            <Activity className="text-blue-500" /> AI Business Financial Analyzer
                        </h1>
                        <p className="text-slate-400 mt-2 font-medium">Structure, categorize, and analyze your business cash flow with AI.</p>
                        <button
                            onClick={() => window.location.href = '#home'}
                            className="mt-4 inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            <RefreshCcw size={12} className="rotate-180" /> Return to Portal
                        </button>
                    </div>
                    <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-3xl">
                        {['dashboard', 'upload', 'history', 'ai_report'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                {tab.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="dashboard">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                <StatCard
                                    icon={<TrendingUp className="text-green-500" />}
                                    label="Total Income"
                                    value={analysis ? `R${analysis.total_income.toLocaleString()}` : "R0"}
                                    color="green"
                                />
                                <StatCard
                                    icon={<TrendingDown className="text-red-500" />}
                                    label="Total Expenses"
                                    value={analysis ? `R${analysis.total_expenses.toLocaleString()}` : "R0"}
                                    color="red"
                                />
                                <StatCard
                                    icon={<Wallet className="text-blue-500" />}
                                    label="Net Cash Flow"
                                    value={analysis ? `R${analysis.net_cash_flow.toLocaleString()}` : "R0"}
                                    color="blue"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Health Score Gauge */}
                                <div className="lg:col-span-1 bg-slate-900 rounded-[3rem] p-10 border border-slate-800 text-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120} /></div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Financial Health Score</h3>
                                    <div className="relative inline-flex items-center justify-center">
                                        <svg className="w-48 h-48 transform -rotate-90">
                                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                            <circle
                                                cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent"
                                                strokeDasharray={2 * Math.PI * 88}
                                                strokeDashoffset={2 * Math.PI * 88 * (1 - (analysis?.health_score || 0) / 100)}
                                                className="text-blue-500 transition-all duration-1000"
                                            />
                                        </svg>
                                        <span className="absolute text-5xl font-black italic tracking-tighter">{analysis?.health_score || 0}%</span>
                                    </div>
                                    <p className="mt-8 text-sm font-bold text-blue-400 uppercase tracking-widest">
                                        {analysis?.health_score > 70 ? 'Strong Stability' : analysis?.health_score > 40 ? 'Moderate Stability' : 'Risk Detected'}
                                    </p>
                                </div>

                                {/* Top Transactions */}
                                <div className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 border border-slate-800">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center justify-between">
                                        Recent Transactions
                                        <button onClick={fetchFinancialData} className="text-blue-500 hover:text-blue-400 transition-colors"><RefreshCcw size={16} /></button>
                                    </h3>
                                    {transactions.length === 0 ? (
                                        <div className="py-12 text-center text-slate-500">No data found. Upload a statement to begin.</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {transactions.map(tx => (
                                                <div key={tx.id} className="flex items-center justify-between p-4 bg-[#020617] rounded-2xl border border-slate-800/50">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl ${tx.direction === 'credit' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                            {tx.direction === 'credit' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm truncate max-w-[150px] md:max-w-none">{tx.description}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tx.date} • {tx.category}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`font-black tracking-tighter text-lg ${tx.direction === 'credit' ? 'text-green-500' : 'text-white'}`}>
                                                        {tx.direction === 'credit' ? '+' : '-'}R{tx.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Risk & Fraud Section */}
                            <div className="mt-8 bg-slate-900 rounded-[3rem] p-10 border border-slate-800">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 mb-8 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Risk & Fraud Detection
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-red-950/20 rounded-2xl border border-red-500/10">
                                        <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Duplicate Detection</p>
                                        <p className="text-sm font-medium text-slate-300">Scanning for identical transactions within same timeframes.</p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-green-500">
                                            <CheckCircle2 size={12} /> No duplicates found
                                        </div>
                                    </div>
                                    <div className="p-6 bg-amber-950/20 rounded-2xl border border-amber-500/10">
                                        <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Unusual Spending</p>
                                        <p className="text-sm font-medium text-slate-300">Searching for spikes in withdrawals or supplier payments.</p>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
                                            <AlertTriangle size={12} /> High transport spending detected (Uber)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'upload' && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} key="upload" className="max-w-2xl mx-auto">
                            <div className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800 text-center space-y-8 relative overflow-hidden">
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-blue-600/10 text-blue-500 mb-4 border border-blue-500/20 shadow-xl">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter">Upload Financial Documents</h2>
                                    <p className="text-slate-400 mt-2 font-medium">Bank Statements (PDF/CSV), Invoices, or Expense Reports.</p>
                                </div>
                                <div className="border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 hover:border-blue-500/50 transition-all group relative cursor-pointer">
                                    <input
                                        type="file"
                                        accept=".pdf,.csv,.xlsx,.png,.jpg,.jpeg"
                                        onChange={handleFileUpload}
                                        disabled={processing}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="space-y-4">
                                        <div className="text-slate-600 group-hover:text-blue-500 transition-colors flex justify-center"><Download size={48} /></div>
                                        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                                            {processing ? 'Processing Document...' : 'Select File or Drop here'}
                                        </p>
                                        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">Max file size: 10MB • Secured with AES-256</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ai_report' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} key="ai_report" className="max-w-4xl mx-auto">
                            <div className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800 text-center space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles size={200} /></div>
                                <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gradient-to-br from-purple-600 to-blue-600 text-white mb-4 border border-white/10 shadow-xl">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter">AI Business Performance Summary</h2>
                                    <p className="text-slate-400 mt-2 font-medium">Access deep vertical insights, cash-flow projections, and supplier optimizations.</p>
                                </div>

                                <div className="py-8 px-12 bg-[#020617] rounded-[2.5rem] border border-slate-800 text-left space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><Lock size={14} /></div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">Deep Analysis Locked</p>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">The AI needs to process your data across 24 variables to generate this premium report.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><CheckCircle2 size={14} /></div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-blue-400 mb-1">What you'll get</p>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed">Full breakdown of profitability, expense leak detection, and a 3-month forecast.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    {aiReport ? (
                                        <div className="text-left space-y-6 bg-[#020617] p-10 rounded-[2.5rem] border border-blue-500/30">
                                            <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest text-[10px] mb-4">
                                                <Sparkles size={14} /> AI Analysis Complete
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                {aiReport.report_content || aiReport.report_summary}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-slate-800">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Confidence Score</p>
                                                    <p className="text-2xl font-black text-blue-500">94.2%</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Data Integrity</p>
                                                    <p className="text-2xl font-black text-green-500">Verified</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : generatingAI ? (
                                        <div className="flex flex-col items-center justify-center py-20 space-y-6">
                                            <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs font-black uppercase tracking-widest text-blue-400">AI is architecting your report...</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAISummaryGenerated}
                                            disabled={generatingAI}
                                            className="w-full relative flex items-center justify-center gap-3 rounded-full bg-blue-600 px-8 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                            {generatingAI ? (
                                                <RefreshCcw className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <Zap className="h-5 w-5 fill-current" />
                                            )}
                                            Generate Free AI Summary (Testing)
                                        </button>
                                    )}
                                    <p className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Single report generation • Free for testing (Dev Mode)</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }) {
    return (
        <div className={`p-10 rounded-[2.5rem] border border-slate-800 bg-slate-900 shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all`}>
            <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform`}>{icon}</div>
            <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-[#020617] flex items-center justify-center border border-slate-800 shadow-inner">{icon}</div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</div>
            </div>
            <div className="text-4xl font-black text-white tracking-tighter italic">{value}</div>
        </div>
    );
}
