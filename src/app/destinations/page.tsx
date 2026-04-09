"use client";

import Image from "next/image";
import { Compass, MapPin, Search } from "lucide-react";
import { useState } from "react";

const ALL_DESTINATIONS = [
    { id: "syl", name: "Sylhet", type: "Nature & Tea", image: "https://images.unsplash.com/photo-1542459030-77a8bdfd7aa8?q=80&w=800&auto=format&fit=crop" },
    { id: "cox", name: "Cox's Bazar", type: "Beach & Sea", image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop" },
    { id: "saj", name: "Sajek Valley", type: "Hills & Clouds", image: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?q=80&w=800&auto=format&fit=crop" },
    { id: "ban", name: "Bandarban", type: "Mountains", image: "https://images.unsplash.com/photo-1464822759023-fea09fc8f810?q=80&w=800&auto=format&fit=crop" },
    { id: "sun", name: "Sunamganj", type: "Haor & Water", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop" },
    { id: "dha", name: "Dhaka", type: "Heritage", image: "https://images.unsplash.com/photo-1513326738677-b9628045e7f2?q=80&w=800&auto=format&fit=crop" }
];

export default function DestinationsPage() {
    const [query, setQuery] = useState("");
    const filtered = ALL_DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) || d.type.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#f4f4f4] pb-20">
            {/* Header */}
            <section className="pt-24 pb-10 px-4 md:px-8 text-center bg-white border-b border-gray-100">
                <span className="inline-block px-3 py-1 rounded-full bg-[#067c18]/10 text-[#067c18] text-[0.75rem] font-bold uppercase tracking-widest mb-3">
                    Bangladesh
                </span>
                <h1
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight"
                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                >
                    Explore <span className="text-[#067c18]">Destinations</span>
                </h1>
                <p className="text-gray-500 max-w-lg mx-auto mb-8 text-base leading-relaxed">
                    Discover beautiful places across Bangladesh, and find verified local guides to experience them authentically.
                </p>
                <div className="max-w-md mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for a city or place…"
                        className="w-full pl-11 pr-4 h-12 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#067c18]/25 focus:border-[#067c18]/30 transition-all shadow-sm"
                    />
                </div>
            </section>

            {/* Grid */}
            <section className="px-4 py-10 md:px-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((dest) => (
                        <div
                            key={dest.id}
                            className="group relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.13)] transition-all duration-300"
                        >
                            <Image
                                src={dest.image}
                                alt={dest.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-5 left-5 right-5">
                                <span className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1 block">
                                    {dest.type}
                                </span>
                                <h3
                                    className="text-white font-bold text-2xl mb-2"
                                    style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                                >
                                    {dest.name}
                                </h3>
                                <div className="flex items-center text-white/80 text-sm font-medium">
                                    <Compass className="h-4 w-4 mr-1.5" />
                                    <span>Explore local guides</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 mt-4">
                        <MapPin className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No destinations match your search.</p>
                        <button onClick={() => setQuery("")} className="mt-4 px-5 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-500 hover:text-[#067c18] hover:border-[#067c18]/30 transition-colors">
                            Show all
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
