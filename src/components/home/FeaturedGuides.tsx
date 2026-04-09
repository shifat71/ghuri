"use client";

import { useEffect, useState } from "react";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { GuideCardProps } from "@/components/guide/GuideCard";
import { ArrowRight, Star, MapPin, ShieldCheck, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Classy fallback portraits for the featured section
const CLASSY_PORTRAITS = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
];

export function FeaturedGuides() {
    const [guides, setGuides] = useState<GuideCardProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeatured() {
            try {
                // get up to 4 guides that have some verified status
                const q = query(
                    collection(db, "guides"),
                    where("nogoriStatus", "in", ["verified", "pro"]),
                    limit(4)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GuideCardProps[];
                setGuides(data);
            } catch (error) {
                console.error("Failed to load featured guides", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeatured();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-gray-100 rounded-[2.5rem] animate-pulse" />)}
            </div>
        );
    }

    if (guides.length === 0) return null;

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
            {guides.map((g, idx) => {
                const highResImage = CLASSY_PORTRAITS[idx % CLASSY_PORTRAITS.length];
                
                return (
                    <motion.div key={g.id} variants={cardVariants} className="group cursor-pointer">
                        <Link href={`/guides/${g.id}`} className="block relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-15px_rgba(142,99,240,0.2)] border border-gray-100">
                            
                            {/* Image with zoom effect */}
                            <img 
                                src={highResImage} 
                                alt={g.name} 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            
                            {/* Smooth gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

                            {/* Wishlist Button */}
                            <button className="absolute top-5 right-5 h-10 w-10 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-colors z-20">
                                <Heart className="h-4 w-4" />
                            </button>

                            {/* Verified Pro Badge */}
                            <div className="absolute top-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-[0.6875rem] font-bold uppercase tracking-widest z-20">
                                <ShieldCheck className="h-3 w-3 text-[#76dd6d]" />
                                Pro Talent
                            </div>

                            {/* Main Info */}
                            <div className="absolute bottom-0 left-0 w-full p-6 z-10 flex flex-col justify-end">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-1 transition-transform duration-500 origin-left" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                                            {g.name?.split(' ')[0] || "Guide"}
                                        </h3>
                                        {g.locations?.[0] && (
                                            <div className="flex items-center gap-1.5 text-white/70">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="text-xs tracking-wide uppercase font-semibold">{g.locations[0]}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                        <span className="text-white text-sm font-bold">{g.rating > 0 ? g.rating.toFixed(1) : "5.0"}</span>
                                    </div>
                                </div>
                                
                                {/* Hover Reveal Separator & Price */}
                                <div className="h-px w-full bg-white/20 my-3 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                
                                <div className="flex items-center justify-between opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-75">
                                    <p className="text-white/90 text-sm font-semibold">
                                        <span className="text-white/60 font-normal">Starting at</span> ৳{g.pricePerDay || 1500}
                                    </p>
                                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center -rotate-45 group-hover:rotate-0 transition-transform duration-500">
                                        <ArrowRight className="h-4 w-4 text-black" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
