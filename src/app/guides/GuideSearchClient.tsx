"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal, ChevronDown } from "lucide-react";
import { GuideCard, GuideCardProps } from "@/components/guide/GuideCard";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const LOCATIONS = ["All", "Sylhet", "Cox's Bazar", "Sreemangal", "Bandarban", "Sajek Valley"];

export function GuideSearchClient({ initialGuides }: { initialGuides: GuideCardProps[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("All");

    const filteredGuides = useMemo(() => {
        return initialGuides.filter((guide) => {
            const matchesSearch =
                (guide.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (guide.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (guide.services?.some(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);

            const matchesLocation =
                locationFilter === "All"
                    ? true
                    : (guide.locations?.includes(locationFilter) ?? false);

            return matchesSearch && matchesLocation;
        });
    }, [initialGuides, searchQuery, locationFilter]);

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    return (
        <div className="w-full flex flex-col gap-8 md:gap-12">

            {/* ─── Premium Search Hero Bar ─── */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/80 backdrop-blur-2xl p-3 md:p-4 rounded-[2rem] border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mx-auto w-full max-w-5xl -mt-16 relative z-20 flex flex-col md:flex-row gap-4 items-center"
            >
                {/* Minimal Search Input */}
                <div className="w-full relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name, service, or keyword…"
                        className="w-full pl-14 pr-6 h-14 bg-gray-50/50 hover:bg-gray-50 border border-transparent rounded-[1.5rem] text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#067c18]/20 focus:border-[#067c18]/20 transition-all duration-300"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter / Sort Actions */}
                <div className="w-full md:w-auto flex gap-3 shrink-0 px-2 md:px-0 pb-1 md:pb-0">
                    <button className="flex-1 md:flex-none h-14 px-6 rounded-[1.5rem] bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-center gap-2 text-gray-600 font-semibold transition-all duration-300">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </button>
                </div>
            </motion.div>

            {/* ─── Location Pills ─── */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex items-center justify-center gap-2 md:gap-3 flex-wrap max-w-4xl mx-auto"
            >
                {LOCATIONS.map((loc) => {
                    const isActive = loc === locationFilter;
                    return (
                        <button
                            key={loc}
                            onClick={() => setLocationFilter(loc)}
                            className={cn(
                                "px-5 h-10 rounded-full text-[0.8125rem] font-bold tracking-wide whitespace-nowrap transition-all duration-300",
                                isActive
                                    ? "bg-[#067c18] text-white shadow-lg shadow-[#067c18]/20 scale-105"
                                    : "bg-white text-gray-500 border border-gray-100 hover:border-[#067c18]/30 hover:text-[#067c18] hover:bg-[#067c18]/5"
                            )}
                        >
                            {loc}
                        </button>
                    );
                })}
            </motion.div>

            {/* ─── Metrics ─── */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <p className="text-gray-500 font-medium">
                    Found <span className="text-gray-900 font-bold">{filteredGuides.length}</span> curated professionals
                </p>
                <button className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                    Sort by: Recommended <ChevronDown className="h-4 w-4" />
                </button>
            </div>

            {/* ─── Results Grid (Animated) ─── */}
            <AnimatePresence mode="wait">
                {filteredGuides.length > 0 ? (
                    <motion.div 
                        key="results-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredGuides.map((guide) => (
                            <motion.div key={guide.id} variants={itemVariants}>
                                <GuideCard {...guide} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="empty-state"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 mt-4"
                    >
                        <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>No guides found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any guides matching your criteria. Try adjusting your filters or search terms.</p>
                        <button
                            className="mt-6 px-6 py-3 rounded-full border border-gray-200 text-sm font-bold text-gray-900 hover:text-[#067c18] hover:border-[#067c18] transition-colors"
                            onClick={() => { setSearchQuery(""); setLocationFilter("All"); }}
                        >
                            Reset all filters
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
