"use client";

import Image from "next/image";
import { Compass, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const ALL_DESTINATIONS = [
    { id: "syl", name: "Sylhet", type: "Nature & Tea", image: "https://images.unsplash.com/photo-1542459030-77a8bdfd7aa8?q=80&w=800&auto=format&fit=crop" },
    { id: "cox", name: "Cox's Bazar", type: "Beach & Sea", image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=800&auto=format&fit=crop" },
    { id: "saj", name: "Sajek Valley", type: "Hills & Clouds", image: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?q=80&w=800&auto=format&fit=crop" },
    { id: "ban", name: "Bandarban", type: "Mountains", image: "https://images.unsplash.com/photo-1464822759023-fea09fc8f810?q=80&w=800&auto=format&fit=crop" },
    { id: "sun", name: "Sunamganj", type: "Haor & Water", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop" },
    { id: "dha", name: "Dhaka", type: "Heritage", image: "https://images.unsplash.com/photo-1513326738677-b9628045e7f2?q=80&w=800&auto=format&fit=crop" }
];

export default function DestinationsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 pb-20">
            {/* Header */}
            <section className="pt-16 pb-10 px-4 md:px-8 text-center bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Explore Destinations</h1>
                <p className="text-slate-500 max-w-lg mx-auto mb-8">
                    Discover beautiful places across Bangladesh, and find verified local guides to experience them authentically.
                </p>
                <div className="max-w-md mx-auto relative rounded-full shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <Input
                        type="text"
                        placeholder="Search for a city or place..."
                        className="pl-12 h-12 rounded-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                    />
                </div>
            </section>

            {/* Grid */}
            <section className="px-4 py-12 md:px-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ALL_DESTINATIONS.map((dest) => (
                        <div key={dest.id} className="group relative rounded-3xl overflow-hidden aspect-[4/3] cursor-pointer bg-slate-100">
                            <Image
                                src={dest.image}
                                alt={dest.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <span className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1 block">
                                    {dest.type}
                                </span>
                                <h3 className="text-white font-bold text-2xl mb-2">{dest.name}</h3>
                                <div className="flex items-center text-white/90 text-sm font-medium">
                                    <Compass className="h-4 w-4 mr-1.5" />
                                    <span>Explore local guides</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
