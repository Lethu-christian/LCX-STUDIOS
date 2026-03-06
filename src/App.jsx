import React, { useMemo, useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LCX_LOGO_B64 } from "./assets/logo-b64";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Admin from "./components/Admin";
import {
    ArrowRight,
    BadgeCheck,
    Bot,
    Building2,
    CheckCircle2,
    ChevronRight,
    Code2,
    Cpu,
    Crown,
    Globe,
    Image as ImageIcon,
    LayoutDashboard,
    Mail,
    Menu,
    MessageCircle,
    Palette,
    Phone,
    Send,
    ShieldCheck,
    Sparkles,
    Star,
    User,
    WalletCards,
    Workflow,
    X,
    Zap,
} from "lucide-react";

const WHATSAPP_NUMBER = "27678846390";
const EMAIL = "hello@lcxstudios.co";
const YOCO_PUBLIC_KEY = "pk_live_0ae064d0XB1g5KAe73b4";

const navItems = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Portfolio", href: "#portfolio" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
];

const serviceCards = [
    {
        icon: Code2,
        title: "Custom Internal Software Systems",
        desc: "Premium internal tools for staff, orders, finance, inventory, operations, and business control.",
        points: [
            "Staff management systems",
            "Order tracking systems",
            "Admin dashboards",
            "Finance/payment systems",
            "Customer management systems",
            "Inventory & operations systems",
        ],
        whatsapp: "Hello, I want a custom internal software system.",
    },
    {
        icon: Crown,
        title: "Pageantry Voting Systems",
        desc: "High-conversion online voting systems for pageants and events with public pages, rankings, and admin control.",
        points: [
            "Public voting pages",
            "Contestant profiles",
            "Rankings and gallery",
            "Admin dashboard",
            "Analytics and portals",
            "Source code handover",
        ],
        whatsapp: "Hello, I want a pageantry voting system.",
    },
    {
        icon: ImageIcon,
        title: "Poster Design Services",
        desc: "Luxury poster design for pageants, modelling shows, entries opens, finalists, semi-finalists, and grand finale campaigns.",
        points: [
            "Finalist posters",
            "Semi-finalist posters",
            "Entries open posters",
            "Grand finale posters",
            "Custom event visuals",
            "Creative direction",
        ],
        whatsapp: "Hello, I want poster design services.",
    },
    {
        icon: Palette,
        title: "Logo Design Services",
        desc: "Modern logo systems and premium visual identity design for brands, events, creators, and businesses.",
        points: [
            "Brand logos",
            "Event logos",
            "Premium concepts",
            "Visual identity direction",
            "Modern company marks",
            "High-end brand feel",
        ],
        whatsapp: "Hello, I want logo design services.",
    },
];

const portfolioItems = [
    {
        category: "Voting Platform",
        title: "Black Barbie Ambassador Voting System",
        desc: "A premium voting experience for pageantry audiences with contestant pages, live rankings, admin control, and conversion-focused purchase flows.",
        badge: "Featured SaaS",
        image: "https://images.unsplash.com/photo-1551288049-bbbda536639a?auto=format&fit=crop&q=80&w=800",
    },
    {
        category: "Internal Business System",
        title: "BlackBarbiebyTK Internal System",
        desc: "A custom business operations system inspired by real internal workflows like staff control, orders, finance tracking, and admin dashboards.",
        badge: "Business Systems",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    },
    {
        category: "Poster Design",
        title: "Black Barbie Ambassador Posters",
        desc: "Bold, luxurious visual campaign work designed for pageant promotion, contestant highlights, and event visibility.",
        badge: "Creative Direction",
        image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800",
    },
    {
        category: "Poster Design",
        title: "Miss Qhawekazi Posters",
        desc: "Elegant pageantry poster direction crafted to communicate prestige, beauty, and strong event identity.",
        badge: "Portfolio Work",
        image: "https://images.unsplash.com/photo-1605142859862-978be7eba909?auto=format&fit=crop&q=80&w=800",
    },
    {
        category: "Poster Design",
        title: "Miss Cosset Posters",
        desc: "Premium event poster concepts with polished layouts, modern typography, and strong social-media-ready appeal.",
        badge: "Luxury Visuals",
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
    },
];

const posterPricing = [
    {
        title: "Finalist Posters",
        price: "R45",
        note: "per poster",
        extra: "Above 30 posters: every poster after the first 30 costs R35 each.",
    },
    {
        title: "Semi-Finalist Posters",
        price: "R25",
        note: "per poster",
        extra: "Above 30 posters: every poster after the first 30 costs R15 each.",
    },
    {
        title: "Entries Open Poster",
        price: "R300",
        note: "once-off",
        extra: "Custom-made according to client specification.",
    },
    {
        title: "Grand Finale Poster",
        price: "R450",
        note: "once-off",
        extra: "Premium event poster with polished creative direction.",
    },
];

const votingPackages = [
    {
        name: "Voting Only Package",
        price: "R45,000",
        support: "2 months service support/control",
        whatsapp: "Hello, I’m interested in your Voting Only Package.",
        featured: false,
        features: [
            "Public voting page",
            "Contestant profiles",
            "Gallery page",
            "Rankings page",
            "Admin dashboard for contestants and gallery updates",
            "No analytics page",
            "No login/register portal",
            "No ticketing",
            "No advanced client portal",
            "Client receives the full source code",
        ],
    },
    {
        name: "Full Voting System",
        price: "R100,000",
        support: "1 year service support/control",
        whatsapp: "Hello, I’m interested in the Full Voting System.",
        featured: true,
        features: [
            "Everything in Voting Only",
            "Full analytics/dashboard",
            "Advanced admin controls",
            "Login and registration",
            "Client portal",
            "Additional advanced features",
            "Scalable full system",
            "Client receives the full source code",
        ],
    },
];

const rentalPackages = [
    {
        name: "1 Month Rental",
        price: "R6,000",
        desc: "Includes custom domain & hosting for 1 month.",
        whatsapp: "Hello, I want to rent the voting system for 1 month.",
    },
    {
        name: "3 Months Rental",
        price: "R8,000",
        desc: "Includes custom domain & hosting for 3 months.",
        whatsapp: "Hello, I want to rent the voting system for 3 months.",
    },
    {
        name: "6 Months Rental",
        price: "R10,000",
        desc: "Includes custom domain & hosting for 6 months.",
        whatsapp: "Hello, I want to rent the voting system for 6 months.",
    },
    {
        name: "1 Year Rental",
        price: "R15,000",
        desc: "Includes custom domain & hosting for 12 months.",
        whatsapp: "Hello, I want to rent the voting system for 12 months.",
    },
];

const buyOptions = [
    {
        title: "Custom Internal Software",
        price: "Custom Quote",
        description: "For businesses that need dashboards, operations systems, finance tools, or internal workflows.",
        cta: "Request a System",
        message: "Hello, I want a custom internal software system.",
    },
    {
        title: "Voting Only Package",
        price: "R45,000",
        description: "A streamlined pageant voting platform with essential public pages and admin updates.",
        cta: "Buy This Package",
        message: "Hello, I’m interested in your Voting Only Package.",
    },
    {
        title: "Full Voting System",
        price: "R100,000",
        description: "A scalable full-featured voting system with analytics, client portal, and advanced controls.",
        cta: "Buy This Package",
        message: "Hello, I’m interested in the Full Voting System.",
    },
];

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

function createWhatsAppLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function handlePayment(amountInCents, description, onSuccess) {
    if (typeof window.YocoSDK === 'undefined') {
        alert("Payment system is still loading. Please try again in a moment.");
        return;
    }

    const yoco = new window.YocoSDK({
        publicKey: YOCO_PUBLIC_KEY,
    });

    yoco.showPopup({
        amountInCents: amountInCents,
        currency: 'ZAR',
        name: 'LCX STUDIOS',
        description: description,
        image: LCX_LOGO_B64,
        displayMethod: 'MANUAL',
        callback: function (result) {
            if (result.error) {
                const errorMessage = result.error.message;
                console.error("Payment failed: " + errorMessage);
                alert("Payment failed: " + errorMessage);
            } else {
                console.log("Token received: " + result.id);
                // Call verification edge function
                supabase.functions.invoke('verify-yoco', {
                    body: { checkoutId: result.id }
                }).then(({ data, error }) => {
                    if (error) {
                        console.error("Verification failed:", error);
                        alert("Payment received but verification failed. Please contact support.");
                    } else if (data.success) {
                        alert("Success! Your payment of " + (data.amount / 100) + " " + data.currency + " has been verified.");
                        if (onSuccess) onSuccess();
                    } else {
                        alert("Payment status: " + data.status);
                    }
                });
            }
        }
    });
}

function SectionHeading({ eyebrow, title, description, center = false, theme = "light" }) {
    const isDark = theme === "dark";
    return (
        <div className={cn("max-w-3xl", center && "mx-auto text-center")}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                    "mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] backdrop-blur-xl",
                    isDark ? "border-white/10 bg-white/5 text-cyan-400" : "border-slate-300 bg-slate-100 text-slate-950"
                )}
            >
                <Sparkles className="h-3 w-3" />
                {eyebrow}
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={cn(
                    "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl",
                    isDark ? "text-white" : "text-slate-950"
                )}
            >
                {title}
            </motion.h2>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={cn(
                    "mt-6 text-base leading-8 sm:text-lg",
                    isDark ? "text-slate-400" : "text-slate-600"
                )}
            >
                {description}
            </motion.p>
        </div>
    );
}

function TopNav({ session, onPortalClick }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 z-50 w-full transition-all duration-300",
            scrolled ? "border-b border-slate-200 bg-white/80 p-4 backdrop-blur-xl" : "bg-transparent p-6"
        )}>
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                <a href="#home" className="flex items-center gap-4 transition-transform hover:scale-105">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 shadow-[0_0_50px_rgba(34,211,238,0.2)] overflow-hidden">
                        <img src="/logo.png" alt="LCX Logo" className="h-full w-full object-cover" />
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-cyan-400/80">Premium Studio</div>
                        <div className="text-xl font-black tracking-[0.2em] text-slate-950">LCX STUDIOS</div>
                    </div>
                </a>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <a key={item.href} href={item.href} className="text-sm font-medium text-slate-600 transition hover:text-cyan-300">
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onPortalClick}
                        className="hidden items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-slate-800 md:inline-flex"
                    >
                        {session ? <LayoutDashboard className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        {session ? "Portal" : "Login / Register"}
                    </button>

                    <a
                        href={createWhatsAppLink("Hello, I want to enquire about LCX STUDIOS services.")}
                        target="_blank"
                        rel="noreferrer"
                        className="hidden items-center gap-2 rounded-full bg-slate-900 border border-slate-700 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-slate-800 md:inline-flex"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Connect
                    </a>

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-950 transition hover:bg-slate-200 md:hidden"
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/95 p-6 backdrop-blur-2xl md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navItems.map((item) => (
                                <a key={item.href} href={item.href} onClick={() => setOpen(false)} className="text-lg font-medium text-slate-700 transition hover:text-cyan-300">
                                    {item.label}
                                </a>
                            ))}
                            <button
                                onClick={() => { setOpen(false); onPortalClick(); }}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-slate-100 py-4 text-sm font-bold uppercase tracking-widest text-slate-950 transition hover:bg-slate-200"
                            >
                                {session ? <LayoutDashboard className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                {session ? "Access Portal" : "Login / Register"}
                            </button>
                            <a
                                href={createWhatsAppLink("Hello, I want to enquire about LCX STUDIOS services.")}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-bold text-slate-950"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

function Hero() {
    return (
        <section id="home" className="relative min-h-screen overflow-hidden pt-32 lg:pt-0 lg:flex lg:items-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0 text-slate-950">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.1),transparent_40%)]" />
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 opacity-[0.02] [background-image:linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] [background-size:100px_100px]" />

                {/* Animated Glows */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -top-[20%] -left-[10%] h-[80%] w-[80%] rounded-full bg-cyan-500/10 blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute -bottom-[20%] -right-[10%] h-[80%] w-[80%] rounded-full bg-blue-600/10 blur-[120px]"
                />
            </div>

            <div className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                <div className="flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-300 bg-slate-100 px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 backdrop-blur-xl"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                        </div>
                        Premium Technology Studio
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl font-bold tracking-tighter text-slate-950 sm:text-6xl md:text-7xl lg:text-8xl"
                    >
                        LCX STUDIOS builds <span className="text-slate-950 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">high-end</span> digital systems.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-700 md:text-xl"
                    >
                        A premium technology and creative studio crafting custom internal systems, SaaS platforms,
                        and elite visual identities for modern brands and businesses.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 flex flex-wrap gap-5"
                    >
                        <a href="#services" className="group relative overflow-hidden rounded-full bg-white px-8 py-5 text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                            View Services
                        </a>
                        <a href="#pricing" className="glass-card border-slate-300 rounded-full px-8 py-5 text-sm font-bold text-slate-950 transition-all hover:bg-slate-200">
                            Buy a Service
                        </a>
                        <a href="#request" className="flex items-center gap-2 px-4 py-5 font-bold text-slate-950 transition-colors hover:text-slate-200">
                            Request System <ArrowRight className="h-4 w-4" />
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 grid grid-cols-2 gap-6 border-t border-slate-100 pt-12 text-slate-500 sm:grid-cols-4"
                    >
                        {[
                            { val: "100%", label: "Custom Code" },
                            { val: "24/7", label: "Support Ready" },
                            { val: "Modern", label: "SaaS Stack" },
                            { val: "Premium", label: "Visuals" },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-xl font-bold text-slate-950">{stat.val}</div>
                                <div className="text-[10px] uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative flex items-center justify-center lg:block"
                >
                    <div className="absolute -inset-10 bg-slate-100 blur-[100px]" />
                    <div className="relative group">
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotateY: [0, 5, 0],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 flex h-[450px] w-[450px] items-center justify-center rounded-[4rem] border border-slate-200 bg-slate-100 p-12 shadow-[0_0_100px_rgba(255,255,255,0.05)] backdrop-blur-2xl transition-all group-hover:border-slate-300"
                        >
                            <img
                                src="/logo.png"
                                alt="LCX Large Logo"
                                className="h-full w-full object-contain filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section >
    );
}

function About() {
    return (
        <section id="about" className="relative bg-slate-950 py-32 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_70%)]" />
            </div>
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-20 lg:grid-cols-2">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                            Visionary Logic
                        </div>
                        <h2 className="text-5xl font-black tracking-tight text-white lg:text-7xl leading-[1.1]">
                            The technology partner for the next generation of business.
                        </h2>
                        <p className="text-lg leading-relaxed text-slate-400 max-w-xl">
                            LCX STUDIOS is a powerhouse for custom software and creative execution. We eliminate the gap between technical complexity and aesthetic excellence, delivering systems that work as beautifully as they look.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {[
                            {
                                icon: Zap,
                                title: "Rapid Deployment",
                                text: "Efficient workflows that get your system live faster without sacrificing quality.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Proven Reliability",
                                text: "Robust internal business tools built to handle scale and complex operations.",
                            },
                            {
                                icon: Globe,
                                title: "Global Standards",
                                text: "Modern SaaS architecture that rivals international technology standards.",
                            },
                            {
                                icon: Crown,
                                title: "Premium Visuals",
                                text: "Luxury identity and UI direction that makes your brand stand out with prestige.",
                            },
                        ].map((item, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: id * 0.1 }}
                                className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10"
                            >
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Services() {
    return (
        <section id="services" className="relative bg-slate-50 py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Capabilities"
                    title="Full-stack tech and design under one banner."
                    description="From internal dashboards for multi-branch companies to high-profile voting systems and premium brand visuals."
                    center
                />

                <div className="mt-20 grid gap-8 lg:grid-cols-2">
                    {serviceCards.map((service, i) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group glass-card relative rounded-[3rem] p-10 transition-all hover:bg-white/[0.08]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-200 text-slate-950">
                                    <service.icon className="h-8 w-8" />
                                </div>
                                <a
                                    href={createWhatsAppLink(service.whatsapp)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full border border-slate-300 bg-slate-100 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-700 transition-all hover:text-slate-950"
                                >
                                    WhatsApp <ChevronRight className="ml-2 inline h-4 w-4" />
                                </a>
                            </div>

                            <h3 className="mt-10 text-3xl font-bold text-slate-950 tracking-tight">{service.title}</h3>
                            <p className="mt-6 text-slate-600 leading-relaxed max-w-lg">
                                {service.desc}
                            </p>

                            <div className="mt-10 grid gap-4 grid-cols-1 sm:grid-cols-2">
                                {service.points.map((point) => (
                                    <div key={point} className="flex items-center gap-3 rounded-2xl bg-slate-100 px-5 py-4 text-xs font-medium text-slate-700">
                                        <CheckCircle2 className="h-4 w-4 text-slate-950 shrink-0" />
                                        {point}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function PricingCards() {
    const [paidItems, setPaidItems] = useState({});

    const handlePurchase = (pkg) => {
        const amountString = pkg.price.replace(/[^0-9]/g, '');
        const amountInCents = parseInt(amountString, 10) * 100;

        handlePayment(amountInCents, `Payment for ${pkg.name}`, () => {
            setPaidItems(prev => ({ ...prev, [pkg.name]: true }));
        });
    };

    return (
        <section id="pricing" className="bg-slate-950 py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                {/* Rental Section */}
                <div className="mb-32">
                    <SectionHeading
                        eyebrow="Rental Service"
                        title="Rent the Voting System"
                        description="Temporary usage options including custom domain & hosting. Service ends after the period."
                        center
                        theme="dark"
                    />
                    <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {rentalPackages.map((pkg, i) => (
                            <motion.div
                                key={pkg.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 flex flex-col"
                            >
                                <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                                <div className="mt-2 text-3xl font-black text-blue-400">{pkg.price}</div>
                                <p className="mt-4 text-xs text-slate-400 leading-relaxed flex-1">{pkg.desc}</p>

                                {paidItems[pkg.name] ? (
                                    <a
                                        href={createWhatsAppLink(`Here is my proof of payment for the ${pkg.name}. My brand details and idea of what I need are: `)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600/20 py-3 text-[10px] sm:text-xs font-bold text-green-400 transition-all hover:bg-green-600/30 text-center px-4 leading-tight"
                                    >
                                        <MessageCircle className="h-4 w-4 shrink-0" />
                                        Send Proof of Payment to LCX STUDIOS with Brand Details
                                    </a>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(pkg)}
                                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white transition-all hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                                    >
                                        <WalletCards className="h-4 w-4" />
                                        Buy / Rent Now
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-32" />

                {/* Core Systems */}
                <SectionHeading
                    eyebrow="Purchases"
                    title="Premium Software Solutions"
                    description="Choose the package that fits your scale. Internal systems and pageantry systems are custom-coded for high-end performance."
                    center
                    theme="dark"
                />

                <div className="mt-20 grid gap-8 lg:grid-cols-2">
                    {votingPackages.map((pkg, i) => (
                        <motion.div
                            key={pkg.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "relative flex flex-col rounded-[2.5rem] border p-10 transition-all hover:scale-[1.02]",
                                pkg.featured ? "border-blue-500 bg-white/5 shadow-[0_0_50px_rgba(59,130,246,0.1)]" : "border-white/10 bg-white/5"
                            )}
                        >
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                                <div className="mt-4 flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tight text-white">{pkg.price}</span>
                                </div>
                                <p className="mt-4 text-sm text-blue-400 font-semibold">{pkg.support}</p>
                            </div>

                            <ul className="mb-10 flex-1 space-y-4">
                                {pkg.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-400">
                                        <BadgeCheck className="h-5 w-5 flex-shrink-0 text-blue-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {paidItems[pkg.name] ? (
                                <a
                                    href={createWhatsAppLink(`Here is my proof of payment for the ${pkg.name}. My brand details and idea of what I need are: `)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={cn(
                                        "flex items-center justify-center gap-2 rounded-2xl py-4 px-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all text-center leading-tight",
                                        "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                                    )}
                                >
                                    <MessageCircle className="h-5 w-5 shrink-0" />
                                    Send Proof of Payment to LCX STUDIOS with Brand Details
                                </a>
                            ) : (
                                <button
                                    onClick={() => handlePurchase(pkg)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold uppercase tracking-widest transition-all",
                                        pkg.featured ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500" : "bg-white/10 text-white hover:bg-white/20"
                                    )}
                                >
                                    <WalletCards className="h-5 w-5" />
                                    Buy This Package
                                </button>
                            )}
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 mt-4 relative flex flex-col md:flex-row items-center justify-between gap-8 rounded-[2.5rem] border border-white/10 bg-white/5 p-10 transition-all"
                    >
                        <div>
                            <h3 className="text-2xl font-bold text-white">Custom Internal Software</h3>
                            <div className="mt-2 text-3xl font-black text-slate-300">Custom Quote</div>
                            <p className="mt-4 text-sm text-slate-400 max-w-xl line-clamp-2">
                                For businesses that need high-end dashboards, operations tracking, finance tools,
                                inventory management, or tailored internal workflows.
                            </p>
                        </div>
                        <a
                            href={createWhatsAppLink("Hello, I want a custom internal software system.")}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-transparent py-4 px-8 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-white/10 shrink-0"
                        >
                            <MessageCircle className="h-5 w-5" />
                            Request System
                        </a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function Portfolio() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        async function fetchPortfolio() {
            try {
                const { data, error } = await supabase
                    .from('portfolio_items')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setItems(data || []);
            } catch (err) {
                console.error("Error fetching portfolio items", err);
            } finally {
                setLoading(false);
            }
        }
        fetchPortfolio();
    }, []);

    return (
        <section id="portfolio" className="relative bg-slate-50 py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Selected Works"
                    title="Digital case studies of premium execution."
                    description="Explore our portfolio of voting systems, internal business tools, and award-winning creative direction."
                    center
                />

                {loading ? (
                    <div className="mt-20 text-center text-slate-400 font-medium">Loading portfolio...</div>
                ) : items.length === 0 ? (
                    <div className="mt-20 text-center text-slate-400 font-medium">No portfolio items added yet.</div>
                ) : (
                    <div className="mt-20 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                        {items.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => setSelectedItem(item)}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] border border-slate-200 bg-slate-50">
                                    <img
                                        src={item.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800"}
                                        alt={item.title}
                                        className="h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-110 group-hover:rotate-1 group-hover:opacity-80"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

                                    {item.badge && (
                                        <div className="absolute top-6 left-6 z-10">
                                            <span className="rounded-full bg-cyan-400 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 shadow-lg">
                                                {item.badge}
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-8 z-10 transition-transform duration-300 group-hover:translate-y-[-8px]">
                                        <div className="mb-4">
                                            <span className="rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center gap-1.5 w-max">
                                                <ImageIcon size={10} /> {item.category}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{item.title}</h3>
                                        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center gap-2">
                                            View Gallery <ArrowRight size={14} />
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Gallery Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-8"
                    >
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
                        >
                            <X size={24} />
                        </button>

                        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] bg-slate-900 border border-white/10 shadow-2xl custom-scrollbar flex flex-col flex-nowrap" onClick={e => e.stopPropagation()}>
                            <div className="p-8 md:p-12 border-b border-white/10 shrink-0">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                                    <ImageIcon size={12} /> {selectedItem.category}
                                </div>
                                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">{selectedItem.title}</h2>
                                <p className="mt-6 text-slate-400 md:text-lg leading-relaxed max-w-3xl">
                                    {selectedItem.description}
                                </p>
                            </div>

                            <div className="p-8 md:p-12 bg-slate-950 flex-grow">
                                {(!selectedItem.gallery_images || selectedItem.gallery_images.length === 0) ? (
                                    <div className="rounded-[2.5rem] border border-white/10 border-dashed p-20 text-center text-slate-500">
                                        No gallery images available for this project.
                                    </div>
                                ) : (
                                    <div className="grid gap-10 grid-cols-1">
                                        {selectedItem.gallery_images.map((imgUrl, idx) => (
                                            <div key={idx} className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl">
                                                <img src={imgUrl} alt={`${selectedItem.title} screenshot ${idx + 1}`} className="w-full h-auto object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

function PosterPricing() {
    return (
        <section className="relative bg-white py-32 border-y border-slate-100">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-20 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="flex flex-col justify-center">
                        <SectionHeading
                            eyebrow="Creative Direction"
                            title="Modern poster and logo design services."
                            description="From finalist posters to premium logo marks. We blend aesthetics with industrial-grade branding strategy."
                        />

                        <div className="mt-12 rounded-[2.5rem] bg-amber-500/5 p-8 border border-amber-500/10 text-sm leading-8 text-amber-200/80">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                                    <Star className="h-5 w-5 fill-current" />
                                </div>
                                <div className="font-bold text-[10px] tracking-[0.3em] uppercase">Service Terms</div>
                            </div>
                            <p>• All designs are custom-made according to client spec.</p>
                            <p>• Design enquiries charged at the price of 1 poster (non-refundable).</p>
                            <p>• Final payment only after client approval of direction.</p>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {posterPricing.map((item) => (
                            <div key={item.title} className="glass-card rounded-[2.5rem] p-10 hover:border-white/30 transition-all flex flex-col">
                                <h3 className="text-xl font-bold text-slate-950">{item.title}</h3>
                                <div className="mt-6 text-4xl font-black text-slate-950">{item.price}</div>
                                <div className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500">{item.note}</div>
                                <p className="mt-6 text-sm leading-relaxed text-slate-600 flex-grow">
                                    {item.extra}
                                </p>
                                <button
                                    onClick={() => handlePayment(parseInt(item.price.replace(/[^\d]/g, '')) * 100, item.title)}
                                    className="mt-8 w-full rounded-2xl bg-white py-4 text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all hover:scale-105 active:scale-95"
                                >
                                    Buy Now
                                </button>
                            </div>
                        ))}

                        <div className="sm:col-span-2 glass-card rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-white/5 to-transparent">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-950 tracking-tight">Logo & Identity Systems</h3>
                                <p className="mt-2 text-slate-600 max-w-md">Modern concepts for brands, companies, events, and individuals starting from R5,000.</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={() => handlePayment(500000, "Logo & Identity Systems")}
                                    className="flex items-center gap-3 rounded-2xl bg-white px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 transition-all hover:scale-105 active:scale-95"
                                >
                                    Buy Now
                                </button>
                                <a href={createWhatsAppLink("Hello, I want logo design services.")} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-100 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-950 transition-all hover:bg-slate-200">
                                    WhatsApp <ArrowRight className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function RequestForm() {
    const [form, setForm] = useState({
        fullName: "",
        company: "",
        email: "",
        phone: "",
        service: "Custom Internal Software System",
        budget: "R20,000 - R50,000",
        systemType: "",
        description: "",
        features: "",
        deadline: "",
    });

    const whatsappHref = useMemo(() => {
        const text = `Hello LCX STUDIOS. I want to request a custom system:%0A%0A- Full Name: ${form.fullName}%0A- Company: ${form.company}%0A- Email: ${form.email}%0A- Phone: ${form.phone}%0A- Service: ${form.service}%0A- Budget: ${form.budget}%0A- Type: ${form.systemType}%0A- Description: ${form.description}%0A- Features: ${form.features}%0A- Deadline: ${form.deadline}`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    }, [form]);

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const inputClass = "mt-3 w-full rounded-2xl border border-slate-100 bg-slate-100 px-6 py-4 text-sm text-slate-950 outline-none focus:border-cyan-400/50 transition-colors placeholder:text-slate-600";

    return (
        <section id="request" className="relative bg-slate-50 py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Project Intake"
                    title="Engineered for your needs."
                    description="Send your requirements directly to the developer and get a response within 24 hours."
                    center
                />

                <div className="mt-20 mx-auto max-w-4xl glass-card rounded-[3rem] p-10 lg:p-16">
                    <div className="grid gap-8 md:grid-cols-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Full Name
                            <input className={inputClass} value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Company (Optional)
                            <input className={inputClass} value={form.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Email Address
                            <input className={inputClass} value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number
                            <input className={inputClass} value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Interested Service
                            <select className={inputClass} value={form.service} onChange={(e) => handleChange("service", e.target.value)}>
                                <option>Custom Internal Software System</option>
                                <option>Voting Only Package</option>
                                <option>Full Voting System</option>
                                <option>Creative Design Services</option>
                            </select>
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Budget Range
                            <select className={inputClass} value={form.budget} onChange={(e) => handleChange("budget", e.target.value)}>
                                <option>Below R10,000</option>
                                <option>R10,000 - R20,000</option>
                                <option>R20,000 - R50,000</option>
                                <option>Above R100,000</option>
                            </select>
                        </label>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Tell us about the project
                                <textarea className={cn(inputClass, "min-h-[160px] resize-none")} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Features, goals, and audience..." />
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 py-6 text-sm font-black uppercase tracking-widest text-slate-950 transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] shadow-2xl"
                            >
                                <Send className="h-5 w-5" />
                                Submit via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section id="contact" className="relative bg-white py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-10 lg:grid-cols-3">
                    {[
                        {
                            icon: MessageCircle,
                            title: "WhatsApp",
                            value: "067 884 6390",
                            href: createWhatsAppLink("Hello, I want to enquire about LCX STUDIOS services."),
                            label: "Chat Now",
                        },
                        {
                            icon: Mail,
                            title: "Enquiries",
                            value: EMAIL,
                            href: `mailto:${EMAIL}`,
                            label: "Email Us",
                        },
                        {
                            icon: Building2,
                            title: "Direct Access",
                            value: "Custom Studio Operations",
                            href: "#request",
                            label: "Start Project",
                        },
                    ].map((item) => (
                        <a
                            key={item.title}
                            href={item.href}
                            className="group glass-card rounded-[3rem] p-10 transition-all hover:bg-slate-200"
                        >
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 transition-transform group-hover:scale-110">
                                <item.icon className="h-8 w-8" />
                            </div>
                            <h3 className="mt-8 text-2xl font-bold text-slate-950 tracking-tight">{item.title}</h3>
                            <p className="mt-2 font-medium text-slate-600">{item.value}</p>
                            <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
                                {item.label} <ArrowRight className="h-4 w-4" />
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}

function SmartChatWidget() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", contact: "", service: "System Request", info: "" });

    const href = useMemo(() => {
        const text = `Live Chat Support Request:%0A- Name: ${form.name}%0A- Contact: ${form.contact}%0A- Service: ${form.service}%0A- Request: ${form.info}`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    }, [form]);

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-8 right-8 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-slate-950 shadow-2xl transition-transform hover:scale-110 active:scale-95 shadow-cyan-500/20"
            >
                <AnimatePresence mode="wait">
                    {open ? <X key="x" className="h-7 w-7" /> : <Bot key="bot" className="h-7 w-7" />}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-28 right-8 z-50 w-[min(calc(100vw-2rem),400px)] overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-50/90 shadow-2xl backdrop-blur-2xl"
                    >
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8 text-slate-950">
                            <div className="text-sm font-black uppercase tracking-widest text-slate-950/60">AI Assistant</div>
                            <h3 className="mt-1 text-2xl font-black tracking-tight">How can we help?</h3>
                            <p className="mt-2 text-xs font-bold text-slate-950/70 leading-relaxed">
                                Connect directly with the LCX STUDIOS team and get your project started.
                            </p>
                        </div>

                        <div className="p-8 space-y-4">
                            <input
                                className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-6 py-4 text-sm text-slate-950"
                                placeholder="Your Name"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                            />
                            <input
                                className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-6 py-4 text-sm text-slate-950"
                                placeholder="Email or WhatsApp Number"
                                value={form.contact}
                                onChange={e => setForm({ ...form, contact: e.target.value })}
                            />
                            <textarea
                                className="w-full h-32 rounded-2xl border border-slate-100 bg-slate-100 px-6 py-4 text-sm text-slate-950 resize-none"
                                placeholder="Briefly describe your request..."
                                value={form.info}
                                onChange={e => setForm({ ...form, info: e.target.value })}
                            />
                            <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 py-5 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl"
                            >
                                <MessageCircle className="h-5 w-5" /> Start Chat
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

function Footer() {
    return (
        <footer className="bg-slate-950 py-20 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-4 justify-center md:justify-start">
                            <div className="h-12 w-12 rounded-xl border border-white/10 bg-slate-900 overflow-hidden p-1">
                                <img src="/logo.png" alt="LCX Logo" className="h-full w-full object-contain" />
                            </div>
                            <div className="text-2xl font-black tracking-[0.2em] text-white">LCX STUDIOS</div>
                        </div>
                        <p className="mt-6 text-sm text-slate-400 max-w-sm leading-8">
                            Premium technology and creative execution for the next generation of brands and businesses.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-8 justify-center">
                        {navItems.map((item) => (
                            <a key={item.href} href={item.href} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                    © {new Date().getFullYear()} LCX STUDIOS. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

export default function App() {
    const [session, setSession] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session && (location.pathname === '/login' || location.pathname === '/register')) {
                navigate('/account');
            }
            if (!session && location.pathname === '/account') {
                navigate('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, location.pathname]);

    const handlePortalClick = () => {
        if (session) {
            navigate('/account');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-white selection:bg-white selection:text-slate-950 flex flex-col">
            <TopNav session={session} onPortalClick={handlePortalClick} />

            <div className="flex-grow">
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <Hero />
                                <About />
                                <Services />
                                <Portfolio />
                                <PricingCards />
                                <PosterPricing />
                                <RequestForm />
                                <Contact />
                                <Footer />
                            </motion.div>
                        } />

                        <Route path="/login" element={
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
                                <Auth
                                    defaultMode="login"
                                    onAuthSuccess={() => navigate('/account')}
                                    onBack={() => navigate('/')}
                                />
                            </motion.div>
                        } />

                        <Route path="/register" element={
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
                                <Auth
                                    defaultMode="register"
                                    onAuthSuccess={() => navigate('/account')}
                                    onBack={() => navigate('/')}
                                />
                            </motion.div>
                        } />

                        <Route path="/account" element={
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="pt-32 pb-20"
                            >
                                <Account
                                    session={session}
                                    onSignOut={() => navigate('/')}
                                    onBack={() => navigate('/')}
                                />
                            </motion.div>
                        } />
                    </Routes>
                </AnimatePresence>
            </div>

            <SmartChatWidget />
        </div>
    );
}
