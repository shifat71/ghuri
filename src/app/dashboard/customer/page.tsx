"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Compass, Calendar, User, ChevronLeft, ChevronRight, MapPin, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// ─── Hero Carousel ────────────────────────────────────────────────────────────

const SLIDES = [
    { seed: "sylhet", label: "Sylhet – Tea Gardens" },
    { seed: "sundarbans", label: "Sundarbans – Mangrove Forest" },
    { seed: "coxsbazar", label: "Cox's Bazar – Longest Sea Beach" },
    { seed: "paharpur", label: "Paharpur – Ancient Ruins" },
    { seed: "rangamati", label: "Rangamati – Lake & Hills" },
    { seed: "srimangal", label: "Srimangal – The Tea Capital" },
    { seed: "kuakata", label: "Kuakata – Sea of Grass" },
];

function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
    const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

    useEffect(() => {
        timerRef.current = setInterval(next, 3000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [next]);

    const resetTimer = (fn: () => void) => {
        if (timerRef.current) clearInterval(timerRef.current);
        fn();
        timerRef.current = setInterval(next, 3000);
    };

    return (
        <div className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden mb-10" style={{ height: "60vh", minHeight: "480px" }}>
            {/* Slides */}
            {SLIDES.map((slide, i) => (
                <div
                    key={slide.seed}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
                >
                    <img
                        src={`https://picsum.photos/seed/${slide.seed}/1920/800`}
                        alt={slide.label}
                        className="w-full h-full object-cover"
                    />
                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    {/* Label */}
                    <div className="absolute bottom-16 left-0 right-0 text-center px-6">
                        <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg">{slide.label}</h2>
                    </div>
                </div>
            ))}

            {/* Left Arrow */}
            <button
                onClick={() => resetTimer(prev)}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={() => resetTimer(next)}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors backdrop-blur-sm"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-5 left-0 right-0 z-10 flex justify-center gap-2.5">
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => resetTimer(() => setCurrent(i))}
                        className="w-3 h-3 rounded-full transition-all duration-300"
                        style={{
                            backgroundColor: i === current ? "#6B7C3F" : "rgba(255,255,255,0.5)",
                            transform: i === current ? "scale(1.4)" : "scale(1)",
                            boxShadow: i === current ? "0 0 8px rgba(107,124,63,0.5)" : "none",
                        }}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── District Cards ───────────────────────────────────────────────────────────

const DISTRICTS = [
    { name: "Sylhet", seed: "sylhet-bd" },
    { name: "Dhaka", seed: "dhaka-bd" },
    { name: "Chittagong", seed: "chittagong-bd" },
    { name: "Cox's Bazar", seed: "coxsbazar-bd" },
    { name: "Rajshahi", seed: "rajshahi-bd" },
    { name: "Khulna", seed: "khulna-bd" },
    { name: "Barisal", seed: "barisal-bd" },
];

function DistrictCards({ onSelect, selected }: { onSelect: (d: string) => void; selected: string | null }) {
    return (
        <div className="mb-10">
            <h2 className="text-xl font-bold mb-4" style={{ color: "#6B7C3F" }}>Explore by District</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {DISTRICTS.map((d) => {
                    const isSelected = selected === d.name;
                    return (
                        <button
                            key={d.name}
                            onClick={() => onSelect(d.name)}
                            className="relative overflow-hidden rounded-xl text-left group transition-all duration-200 focus:outline-none"
                            style={{
                                border: isSelected ? "2.5px solid #6B7C3F" : "2px solid #d1d5db",
                                boxShadow: isSelected ? "0 0 0 3px rgba(107,124,63,0.15)" : undefined,
                            }}
                        >
                            <img
                                src={`https://picsum.photos/seed/${d.seed}/400/220`}
                                alt={d.name}
                                className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: "#a3b85a" }} />
                                <span className="font-semibold text-white text-sm drop-shadow">{d.name}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Tourist Places Data ──────────────────────────────────────────────────────

const TOURIST_PLACES: Record<string, { name: string; description: string }[]> = {
    "Sylhet": [
        { name: "Jaflong", description: "Crystal-clear waters nestled among rolling green hills and stone collections." },
        { name: "Ratargul Swamp Forest", description: "Bangladesh's only freshwater swamp forest, a magical flooded woodland." },
        { name: "Lalakhal", description: "Turquoise river flowing through lush tea estates and emerald hills." },
        { name: "Sri Mangal Tea Gardens", description: "Endless carpets of tea bushes stretching across the Sylhet highlands." },
    ],
    "Dhaka": [
        { name: "Lalbagh Fort", description: "A 17th-century Mughal fort with stunning architecture and gardens." },
        { name: "Ahsan Manzil", description: "The iconic Pink Palace on the banks of the Buriganga river." },
        { name: "National Parliament House", description: "Louis Kahn's modernist masterpiece of concrete and water." },
        { name: "Old Dhaka", description: "A vibrant maze of narrow alleys, rich food culture, and history." },
    ],
    "Chittagong": [
        { name: "Patenga Beach", description: "A popular sea beach at the mouth of the Karnaphuli river." },
        { name: "Foy's Lake", description: "An artificial lake surrounded by hills and an amusement park." },
        { name: "Ethnological Museum", description: "The only ethnological museum in Bangladesh with tribal artifacts." },
        { name: "Karnaphuli River", description: "The lifeline of Chittagong, perfect for sunset boat rides." },
    ],
    "Cox's Bazar": [
        { name: "Inani Beach", description: "A serene coral beach with unique rock formations along the shore." },
        { name: "Himchari National Park", description: "Lush tropical forests and waterfalls overlooking the Bay of Bengal." },
        { name: "Laboni Beach", description: "The main beach strip with vibrant local life and seafood stalls." },
        { name: "Moheshkhali Island", description: "A hilly island with ancient temples and panoramic ocean views." },
    ],
    "Rajshahi": [
        { name: "Somapura Mahavihara", description: "UNESCO World Heritage Site — one of the largest Buddhist monasteries in Asia." },
        { name: "Varendra Research Museum", description: "The oldest museum in Bangladesh with rare archaeological collections." },
        { name: "Puthia Temple Complex", description: "A cluster of ornate Hindu temples with exquisite terracotta art." },
        { name: "Padma River", description: "The mighty river offering stunning sunsets and boat excursions." },
    ],
    "Khulna": [
        { name: "Sundarbans", description: "The world's largest mangrove forest and home of the Royal Bengal Tiger." },
        { name: "Khan Jahan Ali Tomb", description: "A historic mausoleum of the legendary saint and city founder." },
        { name: "Sixty Dome Mosque", description: "A UNESCO World Heritage Site — a magnificent 15th-century mosque." },
        { name: "Harbaria Eco Trail", description: "A wooden boardwalk trail through the deep mangrove wilderness." },
    ],
    "Barisal": [
        { name: "Kuakata Sea Beach", description: "The 'Daughter of the Sea' — one of the rare beaches where you can watch both sunrise and sunset." },
        { name: "Floating Guava Market", description: "A unique waterborne market where fresh guavas are traded from boats." },
        { name: "Durga Sagar", description: "The largest pond in southern Bangladesh surrounded by serene natural beauty." },
        { name: "Guthia Mosque", description: "A beautiful Mughal-era mosque with intricate terracotta ornamentation." },
    ],
};

// ─── Guide Interface ──────────────────────────────────────────────────────────

interface GuideWithUser {
    guideDocId: string;
    userId: string;
    tagline?: string;
    bio?: string;
    rating?: number;
    totalReviews?: number;
    coverPhotoURL?: string;
    displayName: string;
    photoURL?: string;
}

// ─── Expanded District Section ────────────────────────────────────────────────

function DistrictExpandedSection({ district }: { district: string }) {
    const [guides, setGuides] = useState<GuideWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Scroll into view on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
        return () => clearTimeout(timer);
    }, [district]);

    // Fetch guides from Firestore
    useEffect(() => {
        const fetchGuides = async () => {
            setLoading(true);
            try {
                const q = query(
                    collection(db, "guides"),
                    where("locations", "array-contains", district),
                    where("isActive", "==", true)
                );
                const snap = await getDocs(q);
                const guideResults: GuideWithUser[] = [];

                for (const guideDoc of snap.docs) {
                    const data = guideDoc.data();
                    // Skip suspended guides
                    if (data.nogoriStatus === "suspended") continue;

                    // Fetch user info
                    let displayName = "Unknown Guide";
                    let photoURL: string | undefined;
                    if (data.userId) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", data.userId));
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                displayName = userData.displayName || "Unknown Guide";
                                photoURL = userData.photoURL;
                            }
                        } catch {
                            // silently fallback
                        }
                    }

                    guideResults.push({
                        guideDocId: guideDoc.id,
                        userId: data.userId || guideDoc.id,
                        tagline: data.tagline,
                        bio: data.bio,
                        rating: data.rating,
                        totalReviews: data.totalReviews,
                        coverPhotoURL: data.coverPhotoURL,
                        displayName,
                        photoURL,
                    });
                }

                setGuides(guideResults);
            } catch (err) {
                console.error("Error fetching guides:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuides();
    }, [district]);

    const places = TOURIST_PLACES[district] || [];

    return (
        <div ref={sectionRef} className="mb-12 scroll-mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Section Heading */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: "#6B7C3F" }} />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Exploring <span style={{ color: "#6B7C3F" }}>{district}</span>
                </h2>
            </div>

            {/* Tourist Places */}
            <div className="mb-10">
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin className="h-5 w-5" style={{ color: "#6B7C3F" }} />
                    Tourist Places
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {places.map((place) => {
                        const seed = place.name.toLowerCase().replace(/\s+/g, "-");
                        return (
                            <div key={place.name} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-300 group">
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={`https://picsum.photos/seed/${seed}/400/250`}
                                        alt={place.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>
                                <div className="p-3">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{place.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{place.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Available Guides */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <User className="h-5 w-5" style={{ color: "#6B7C3F" }} />
                    Available Guides
                </h3>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                ) : guides.length === 0 ? (
                    <div
                        className="text-center py-14 rounded-2xl border border-dashed bg-slate-50/50 dark:bg-slate-800/30"
                        style={{ borderColor: "#6B7C3F" }}
                    >
                        <Compass className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "#6B7C3F" }} />
                        <p className="font-medium text-slate-600 dark:text-slate-400">No guides available in this district yet.</p>
                        <p className="text-sm text-slate-400 mt-1">Check back soon — new guides join regularly!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {guides.map(g => (
                            <div
                                key={g.guideDocId}
                                className="p-5 rounded-xl border bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow duration-300 flex flex-col"
                                style={{ borderColor: "rgba(107,124,63,0.25)" }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    {/* Avatar */}
                                    {g.photoURL ? (
                                        <img
                                            src={g.photoURL}
                                            alt={g.displayName}
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2"
                                            style={{ borderColor: "#6B7C3F" }}
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white text-lg font-bold"
                                            style={{ backgroundColor: "#6B7C3F" }}
                                        >
                                            {g.displayName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold text-slate-900 dark:text-white truncate">{g.displayName}</p>
                                        {g.tagline && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{g.tagline}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                                        {g.rating !== undefined ? g.rating.toFixed(1) : "New"}
                                    </span>
                                    {g.totalReviews !== undefined && g.totalReviews > 0 && (
                                        <span className="text-xs text-slate-400">({g.totalReviews} reviews)</span>
                                    )}
                                </div>

                                {/* Book Button */}
                                <Button
                                    className="w-full mt-auto rounded-xl font-semibold text-white"
                                    style={{ backgroundColor: "#6B7C3F" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#5a6a34")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6B7C3F")}
                                >
                                    Book Guide
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function CustomerDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    // Auth Guard
    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "customer") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "orders"),
                    where("customerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const ordersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        if (user && dbUser?.role === "customer") {
            fetchOrders();
        }
    }, [user, dbUser]);

    const handleDistrictSelect = (district: string) => {
        setSelectedDistrict(prev => prev === district ? null : district);
    };

    if (loading || dbUser?.role !== "customer") return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Trips</h1>
                    <p className="text-slate-500">Manage your upcoming and past adventures.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/customer/profile">
                        <Button variant="outline" className="rounded-xl flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </Button>
                    </Link>
                    <Link href="/guides">
                        <Button className="rounded-xl flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                            <Compass className="h-4 w-4" />
                            Find New Guide
                        </Button>
                    </Link>
                </div>
            </div>

            <HeroCarousel />
            <DistrictCards onSelect={handleDistrictSelect} selected={selectedDistrict} />
            {selectedDistrict && <DistrictExpandedSection district={selectedDistrict} />}

            {/* My Trips */}
            <h2 className="text-xl font-bold mb-4 mt-2 text-slate-900 dark:text-white">My Trips</h2>
            {isLoadingOrders ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="w-full h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-slate-500 text-sm flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {order.startDate?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trip with Guide #{order.guideId.substring(0, 5)}</h3>
                                <p className="text-slate-500 text-sm mt-1">Total: ৳{order.totalPrice}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="rounded-xl">View Details</Button>
                                {order.whatsappMessageId && (
                                    <Button className="bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl">Open WhatsApp</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No trips yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven&#39;t booked any experiences yet. Browse our verified local guides to start your next adventure.</p>
                    <Link href="/guides">
                        <Button size="lg" className="rounded-xl">Explore Guides</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
