"use client";

import Link from "next/link";
import { ArrowRight, Camera, Map, MonitorSmartphone, Package, CheckCircle2, TrendingUp, Search, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { FeaturedGuides } from "@/components/home/FeaturedGuides";
import { GlobalFeed } from "@/components/home/GlobalFeed";
import { RecentActivitySidebar } from "@/components/home/RecentActivitySidebar";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Home() {
    const t = useTranslations('Landing');

    const CATEGORIES = [
        { title: t('catTourGuides'), description: "Expert navigators", icon: Map, accentClass: "text-[#067c18]", bg: "bg-[#067c18]" },
        { title: t('catPhotography'), description: "Capture moments", icon: Camera, accentClass: "text-violet-600", bg: "bg-violet-600" },
        { title: t('catTech'), description: "On-the-go help", icon: MonitorSmartphone, accentClass: "text-sky-500", bg: "bg-sky-500" },
        { title: t('catEveryday'), description: "Errands & tasks", icon: Package, accentClass: "text-rose-500", bg: "bg-rose-500" },
    ];

    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    // Elegant placeholder image
    // const HERO_BG = "https://images.unsplash.com/photo-1506501139174-099022df5260?q=80&w=2942&auto=format&fit=crop";
    const HERO_BG = "/hero_banner.jpg";

    return (
        <div className="flex flex-col bg-[#fafafa]">

            {/* ─── 100vh EXACT HERO CONTAINER ─────────────────────────── */}
            <section ref={containerRef} className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-between pt-0">

                {/* Full Bleed Image hitting exact top */}
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-0 z-0 bg-black"
                >
                    <img
                        src={HERO_BG}
                        alt="Bangladesh landscape"
                        className="w-full h-full object-cover opacity-70 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/60 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#067c18]/10 to-transparent mix-blend-overlay" />
                </motion.div>

                {/* Navbar sits on Top 0 in layout.tsx, so we push content down */}
                <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center px-4 max-w-5xl mx-auto text-center pt-24 pb-8">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/90 text-[0.75rem] font-medium uppercase tracking-[0.25em] mb-8 shadow-2xl">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-200 animate-pulse shadow-[0_0_8px_rgba(253,230,138,0.8)]" />
                            Verified Student Experts
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05] max-w-4xl"
                        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                    >
                        {t('heroTitle1')} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-50 via-amber-200/90 to-amber-500 pr-4 drop-shadow-sm">
                            {t('heroTitle2')}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-6 text-lg md:text-xl text-white/70 max-w-xl leading-relaxed font-light"
                    >
                        {t('heroSubtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
                    >
                        <Link href="/guides">
                            <Button
                                size="lg"
                                className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-100 font-bold text-[0.9375rem] transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                            >
                                {t('exploreTalent')}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="/how-it-works">
                            <Button
                                size="lg"
                                variant="outline"
                                className="h-14 px-8 rounded-full border-white/20 text-white bg-transparent hover:bg-white/10 backdrop-blur-md font-semibold transition-all duration-300"
                            >
                                <Play className="mr-2 h-4 w-4 fill-white/80" />
                                Watch Demo
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Glass Category Cards Row (Bottom of 100vh) */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
                >
                    {CATEGORIES.map((cat, idx) => (
                        <motion.div
                            key={cat.title}
                            whileHover={{ y: -8, scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="bg-white/10 hover:bg-white/15 backdrop-blur-xl border border-white/20 rounded-[2rem] p-5 cursor-pointer flex items-center gap-4 group"
                        >
                            <div className={`h-12 w-12 rounded-full ${cat.bg} flex items-center justify-center shrink-0`}>
                                <cat.icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-bold text-[0.9375rem] truncate" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                                    {cat.title}
                                </h3>
                                <p className="text-white/60 text-xs truncate mt-0.5">{cat.description}</p>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white transition-colors duration-300">
                                <ArrowRight className="h-3.5 w-3.5 text-white group-hover:text-black" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ─── HOW IT WORKS (Smooth Reveal & Gradient) ─────────────────────────── */}
            <section className="relative w-full px-4 py-32 overflow-hidden bg-gradient-to-br from-white via-white to-[#067c18]/5">
                {/* Decorative background orbs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#067c18]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#8e63f0]/5 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#067c18]/10 text-[#067c18] text-xs font-bold uppercase tracking-[0.15em] mb-6 shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#067c18]" />
                            Process
                        </span>
                        <h2
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-[1.1]"
                            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                        >
                            {t('timelineTitle')}
                        </h2>
                        <p className="text-gray-500 text-lg md:text-xl mb-12 leading-relaxed max-w-lg">{t('timelineSubtitle')}</p>

                        <div className="space-y-6">
                            {[
                                { step: "01", title: t('step1'), desc: t('step1Desc') },
                                { step: "02", title: t('step2'), desc: t('step2Desc') },
                                { step: "03", title: t('step3'), desc: t('step3Desc') },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.02, x: 10 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="flex gap-6 group bg-white/60 hover:bg-white backdrop-blur-xl border border-gray-100 hover:border-[#067c18]/20 p-6 rounded-3xl transition-all duration-500 cursor-pointer shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_40px_-15px_rgba(6,124,24,0.15)]"
                                >
                                    <div className="flex flex-col items-center">
                                        <div className="h-14 w-14 rounded-2xl bg-gray-50 text-gray-400 font-bold flex items-center justify-center group-hover:bg-[#067c18] group-hover:text-white transition-colors duration-500">
                                            {item.step}
                                        </div>
                                    </div>
                                    <div>
                                        <h4
                                            className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#067c18] transition-colors duration-500"
                                            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                                        >
                                            {item.title}
                                        </h4>
                                        <p className="text-gray-500 leading-relaxed text-[0.9375rem]">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-[3rem] overflow-hidden relative border-[8px] border-white shadow-[0_30px_80px_-20px_rgba(6,124,24,0.15)]">
                            <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1649&auto=format&fit=crop" alt="Student at work" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-8 left-8 right-8">
                                <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <CheckCircle2 className="h-6 w-6 text-[#067c18]" />
                                        <span className="text-gray-900 font-bold text-lg">{t('jobBadge1')}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">"Incredible photography skills. Highly recommend hiring verified students!"</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <motion.div
                            animate={{ y: [-10, 10, -10] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -left-16 top-1/3 bg-white p-5 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] border border-gray-100 hidden lg:block"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 bg-gradient-to-br from-[#067c18]/10 to-[#067c18]/5 text-[#067c18] rounded-2xl flex items-center justify-center border border-[#067c18]/10">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900">{t('jobBadge2')}</p>
                                    <p className="text-sm text-gray-500 font-medium">Fast &amp; Secure matching</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ─── FEATURED GUIDES ───────────────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="px-4 py-24 bg-white rounded-t-[4rem] border-t border-gray-100 -mt-8 relative z-10"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#8e63f0]/10 text-[#8e63f0] text-xs font-bold uppercase tracking-[0.15em] mb-4">
                                Top Verified
                            </span>
                            <h2
                                className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight"
                                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                            >
                                {t('featuredTitle')}
                            </h2>
                        </div>
                        <Button variant="ghost" className="rounded-full text-[#8e63f0] hover:bg-[#8e63f0]/10 hover:text-[#8e63f0] font-semibold text-sm h-12 px-6">
                            View all guides <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                    <FeaturedGuides />
                </div>
            </motion.section>

            {/* ─── GLOBAL FEED ───────────────────────────────────────────────── */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="px-4 py-32 bg-[#fafafa]"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#067c18]/10 text-[#067c18] text-xs font-bold uppercase tracking-[0.15em] mb-4">
                            Live Feed
                        </span>
                        <h2
                            className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight"
                            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                        >
                            {t('recentActivityTitle')}
                        </h2>
                        <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">{t('recentActivityDesc')}</p>
                    </div>
                    <div className="grid lg:grid-cols-12 gap-10 relative">
                        {/* Main Feed Column */}
                        <div className="lg:col-span-8 flex flex-col gap-10">
                            <GlobalFeed />
                        </div>

                        {/* Dashboard Sidebar Column */}
                        <div className="lg:col-span-4 hidden lg:block relative">
                            <RecentActivitySidebar />
                        </div>
                    </div>
                </div>
            </motion.section>

        </div>
    );
}
