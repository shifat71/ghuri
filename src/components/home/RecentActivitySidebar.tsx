"use client";

import { motion } from "framer-motion";
import { MapPin, TrendingUp, Camera, Car, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

// High-end mock data for the sidebar widgets
const TOP_PLACES = [
    { name: "Sajek Valley", count: 1240, trend: "+12%" },
    { name: "Cox's Bazar", count: 980, trend: "+5%" },
    { name: "Sylhet Tea Gardens", count: 850, trend: "+18%" }
];

const RECENT_VISITS = [
    { name: "Bandarban Hills", time: "2 hours ago", users: 12 },
    { name: "Ahsan Manzil", time: "5 hours ago", users: 5 },
    { name: "Saint Martin's Island", time: "1 day ago", users: 28 }
];

const CATEGORY_WORK = [
    { name: "Photography", count: 342, icon: Camera, color: "text-violet-500", bg: "bg-violet-500/10" },
    { name: "Guided Tours", count: 890, icon: MapPin, color: "text-[#067c18]", bg: "bg-[#067c18]/10" },
    { name: "Transport", count: 156, icon: Car, color: "text-sky-500", bg: "bg-sky-500/10" },
    { name: "Errands & Setup", count: 98, icon: Briefcase, color: "text-rose-500", bg: "bg-rose-500/10" },
];

export function RecentActivitySidebar() {
    return (
        <div className="flex flex-col gap-8 w-full sticky top-32 h-fit self-start pb-8">
            
            {/* ─── WIDGET 1: Top & Recent Places ─── */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
                {/* Decorative Blur */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#067c18]/5 rounded-full blur-[40px] pointer-events-none" />

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                        Trending Spots
                    </h3>
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Top Visited All-Time</p>
                        {TOP_PLACES.map((place, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#067c18]/10 transition-colors">
                                        <MapPin className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#067c18] transition-colors" />
                                    </div>
                                    <span className="font-semibold text-gray-700 group-hover:text-gray-900 transition-colors text-sm">{place.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-gray-900">{place.count.toLocaleString()}</span>
                                    <span className="text-[10px] font-bold text-[#067c18]">{place.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px w-full bg-gray-100" />

                    <div className="space-y-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Live Recent Visits</p>
                        {RECENT_VISITS.map((visit, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                <div>
                                    <span className="block font-semibold text-gray-700 group-hover:text-gray-900 transition-colors text-sm">{visit.name}</span>
                                    <span className="text-[11px] text-gray-400">{visit.time}</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 group-hover:border-gray-200 transition-colors">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#067c18] animate-pulse" />
                                    <span className="text-xs font-semibold text-gray-600">{visit.users} active</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <Link href="/destinations" className="mt-8 flex items-center gap-2 text-[0.8125rem] font-bold text-[#067c18] hover:text-[#055f12] transition-colors w-max">
                    Explore all destinations <ChevronRight className="h-4 w-4" />
                </Link>
            </motion.div>


            {/* ─── WIDGET 2: Recent Work by Category ─── */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                        Platform Impact
                    </h3>
                </div>

                <div className="space-y-5">
                    {CATEGORY_WORK.map((cat, idx) => {
                        // Calculate percentage for progress bar (mock max 1000)
                        const percentage = Math.min((cat.count / 1000) * 100, 100);

                        return (
                            <div key={idx} className="group cursor-pointer">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-xl ${cat.bg} flex items-center justify-center transition-colors`}>
                                            <cat.icon className={`h-5 w-5 ${cat.color}`} />
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-gray-900 text-[0.9375rem]">{cat.name}</span>
                                            <span className="text-[0.6875rem] font-medium text-gray-400 uppercase tracking-wide">Jobs Completed</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-gray-900 text-lg">{cat.count}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${percentage}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: "easeOut" }}
                                        className={`h-full rounded-full ${cat.bg.replace('/10', '')}`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

        </div>
    );
}
