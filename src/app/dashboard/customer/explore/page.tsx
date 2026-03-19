"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Star, MapPin, BadgeCheck, Filter, ChevronDown, LayoutGrid, Map as MapIcon, CalendarDays } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal";
import dynamic from "next/dynamic";

// Dynamically import Leaflet with SSR disabled
const ExploreMap = dynamic(
    () => import("@/components/maps/ExploreMap"),
    { 
        ssr: false,
        loading: () => <div className="h-[600px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2rem] flex items-center justify-center font-bold text-slate-400">Loading Discovery Map...</div>
    }
);

interface Guide {
    id: string;
    name: string;
    tagline?: string;
    bio?: string;
    avatarUrl?: string;
    coverPhotoURL?: string;
    locations: string[];
    languages: string[];
    rating: number;
    totalReviews: number;
    serviceCharge?: number;
    nogoriStatus: string;
    position?: { lat: number, lng: number };
    spots?: { lat: number, lng: number, label: string }[];
    availableDates?: string[];
}

export default function ExploreGuidesPage() {
    const { settings } = useAdminSettings();
    const [guides, setGuides] = useState<Guide[]>([]);
    const [filtered, setFiltered] = useState<Guide[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

    // Filters
    const [search, setSearch] = useState("");
    const [filterLocation, setFilterLocation] = useState("");
    const [filterMaxPrice, setFilterMaxPrice] = useState(10000);
    const [filterMinRating, setFilterMinRating] = useState(0);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchGuides = async () => {
            setIsLoading(true);
            try {
                const q = query(collection(db, "guides"), where("isActive", "==", true));
                const snap = await getDocs(q);
                const guideList: Guide[] = [];

                for (const guideDoc of snap.docs) {
                    const data = guideDoc.data();
                    if (data.nogoriStatus === "suspended") continue;

                    let name = data.name || "Unknown Guide";
                    let avatarUrl = data.avatarUrl;

                    // fetch user name if not on guide doc
                    if (!name || name === "Unknown Guide") {
                        try {
                            const userId = data.userId || guideDoc.id;
                            const userSnap = await getDoc(doc(db, "users", userId));
                            if (userSnap.exists()) {
                                name = userSnap.data().displayName || name;
                                avatarUrl = avatarUrl || userSnap.data().photoURL;
                            }
                        } catch {}
                    }

                    guideList.push({
                        id: guideDoc.id,
                        name,
                        avatarUrl,
                        tagline: data.tagline,
                        bio: data.bio,
                        locations: data.locations || [],
                        languages: data.languages || [],
                        rating: data.rating || 0,
                        totalReviews: data.totalReviews || 0,
                        serviceCharge: data.serviceCharge,
                        nogoriStatus: data.nogoriStatus,
                        coverPhotoURL: data.coverPhotoURL,
                        position: data.position,
                        spots: data.spots || [],
                        availableDates: data.availableDates || [],
                    });
                }

                setGuides(guideList);
                setFiltered(guideList);
            } catch (err) {
                console.error("Error fetching guides:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGuides();
    }, []);

    useEffect(() => {
        let result = [...guides];
        if (search) result = result.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || (g.tagline || "").toLowerCase().includes(search.toLowerCase()));
        if (filterLocation) result = result.filter(g => g.locations.some(l => l.toLowerCase().includes(filterLocation.toLowerCase())));
        if (filterMaxPrice < 10000) result = result.filter(g => (g.serviceCharge || 0) <= filterMaxPrice);
        if (filterMinRating > 0) result = result.filter(g => g.rating >= filterMinRating);
        setFiltered(result);
    }, [search, filterLocation, filterMaxPrice, filterMinRating, guides]);

    const locations = [...new Set(guides.flatMap(g => g.locations))].sort();

    return (
        <div className="max-w-6xl space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Find Your Guide</h1>
                    <p className="text-slate-500 font-medium">Verified local experts across Bangladesh ready for your next adventure.</p>
                </div>
                
                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit shrink-0 shadow-inner">
                    <button 
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "grid" ? "bg-white dark:bg-slate-900 shadow-xl text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <LayoutGrid className="h-4 w-4" /> Grid
                    </button>
                    <button 
                        onClick={() => setViewMode("map")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === "map" ? "bg-white dark:bg-slate-900 shadow-xl text-teal-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                        <MapIcon className="h-4 w-4" /> Map
                    </button>
                </div>
            </div>

            {/* Search + Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search guides by name, specialty, or area..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-12 h-14 rounded-[1.25rem] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-lg focus:ring-teal-500"
                    />
                </div>
                <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className={`h-14 px-6 rounded-[1.25rem] flex items-center gap-2 font-bold transition-all ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white'}`}>
                    <Filter className="h-4 w-4" /> Filters <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
                <Card className="p-8 rounded-[2rem] border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-xl bg-white dark:bg-slate-900/50 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3" /> Preferred Location</label>
                        <select
                            value={filterLocation}
                            onChange={e => setFilterLocation(e.target.value)}
                            className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-sm font-medium focus:ring-2 ring-teal-500 transition-all outline-none"
                        >
                            <option value="">All Regions</option>
                            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max Daily Rate</label>
                            <span className="text-sm font-black text-teal-600">৳{filterMaxPrice.toLocaleString()}</span>
                        </div>
                        <input type="range" min={settings.minCharge || 500} max={settings.maxCharge || 10000} step={100} value={filterMaxPrice}
                            onChange={e => setFilterMaxPrice(Number(e.target.value))}
                            className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>৳{settings.minCharge || 500}</span><span>৳{settings.maxCharge || 10000}</span>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guide Feedback</label>
                        <div className="flex gap-2">
                            {[0, 3, 4, 4.5].map(r => (
                                <button key={r} onClick={() => setFilterMinRating(r)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all ${filterMinRating === r ? 'bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-600/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'}`}>
                                    {r === 0 ? 'Any' : `${r}+ ★`}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>
            )}

            {/* Main Results Area */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-80 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
                </div>
            ) : (
                <div className="space-y-12">
                    {/* 1. Discovery Map */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <MapIcon className="h-5 w-5 text-teal-600" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discovery Map</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase ml-auto">Search or browse to find local experts</p>
                        </div>
                        <ExploreMap guides={filtered} onBook={setSelectedGuide} />
                    </div>

                    {/* 2. Guides Grid */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <LayoutGrid className="h-5 w-5 text-teal-600" />
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Available Guides</h2>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filtered.length} Experts active</span>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <Card className="p-20 text-center rounded-[3rem] border-dashed border-2 border-slate-200 dark:border-slate-800 bg-transparent">
                                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No guides found</h3>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto">Try broadening your filters or searching for a different area in Bangladesh.</p>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filtered.map(guide => (
                                    <Card key={guide.id} className="rounded-[2.5rem] border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white dark:bg-slate-900">
                                        {/* Cover Photo */}
                                        <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                                            <img
                                                src={guide.coverPhotoURL || `https://picsum.photos/seed/${guide.id}/600/350`}
                                                alt={guide.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            
                                            {/* Status Badge */}
                                            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                                {(guide.nogoriStatus === 'verified' || guide.nogoriStatus === 'pro' || guide.nogoriStatus === 'elite') && (
                                                    <div className="bg-white/95 backdrop-blur-md text-teal-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-black shadow-lg">
                                                        <BadgeCheck className="h-3 w-3" /> Nogori {guide.nogoriStatus.toUpperCase()}
                                                    </div>
                                                )}
                                                {/* Availability Badge */}
                                                {(guide as any).availableDates?.length > 0 && (
                                                    <div className="bg-teal-600/90 backdrop-blur-md text-white rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-black shadow-lg">
                                                        <CalendarDays className="h-3 w-3" /> {(guide as any).availableDates.length} Days Available
                                                    </div>
                                                )}
                                            </div>

                                            {/* Rating overlay */}
                                            <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-black">
                                                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                                {guide.rating > 0 ? guide.rating.toFixed(1) : 'New'}
                                            </div>

                                            {/* Avatar floating */}
                                            <div className="absolute -bottom-6 left-6">
                                                <div className="h-16 w-16 rounded-2xl border-4 border-white dark:border-slate-900 bg-indigo-600 flex items-center justify-center shadow-xl overflow-hidden transform group-hover:scale-105 transition-transform">
                                                    {guide.avatarUrl ? (
                                                        <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-white text-2xl font-black">{guide.name[0]}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Info */}
                                        <div className="p-6 pt-10 flex flex-col flex-1">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors">{guide.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">{guide.tagline || 'Experience the beauty of Bangladesh'}</p>
                                            </div>

                                            {guide.locations.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-6">
                                                    {guide.locations.slice(0, 3).map(loc => (
                                                        <span key={loc} className="text-[9px] font-black uppercase tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                                            {loc}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-auto pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Daily Rate</p>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">
                                                        {guide.serviceCharge ? `৳${guide.serviceCharge.toLocaleString()}` : '—'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => window.open(`/guides/${guide.id}`, '_blank')}
                                                        className="rounded-2xl px-4 h-12 font-bold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
                                                    >
                                                        Details
                                                    </Button>
                                                    <Button
                                                        onClick={() => setSelectedGuide(guide)}
                                                        className="bg-slate-900 hover:bg-teal-600 text-white rounded-2xl px-6 h-12 font-black transition-all shadow-xl shadow-slate-900/10 active:scale-95"
                                                    >
                                                        Book
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Modal */}
            {selectedGuide && (
                <BookingModal
                    guide={selectedGuide}
                    onClose={() => setSelectedGuide(null)}
                />
            )}
        </div>
    );
}
