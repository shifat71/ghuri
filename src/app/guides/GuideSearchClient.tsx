"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GuideCard, GuideCardProps } from "@/components/guide/GuideCard";
import { Button } from "@/components/ui/button";

export function GuideSearchClient({ initialGuides }: { initialGuides: GuideCardProps[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("");

    const LOCATIONS = ["All", "Sylhet", "Cox's Bazar", "Sreemangal", "Bandarban", "Sajek Valley"];

    const filteredGuides = useMemo(() => {
        return initialGuides.filter((guide) => {
            const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (guide.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                (guide.services?.some(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);

            const matchesLocation = locationFilter === "" || locationFilter === "All" ? true : guide.locations.includes(locationFilter);

            return matchesSearch && matchesLocation;
        });
    }, [initialGuides, searchQuery, locationFilter]);

    return (
        <div className="w-full flex flex-col gap-8">

            {/* Search and Filter Panel */}
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-center">

                <div className="w-full md:flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by name, service, or keyword..."
                        className="pl-12 h-14 bg-slate-50 dark:bg-slate-900/50 border-none rounded-2xl text-base focus-visible:ring-1 focus-visible:ring-teal-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex gap-2 shrink-0">
                    {LOCATIONS.map(loc => (
                        <button
                            key={loc}
                            onClick={() => setLocationFilter(loc)}
                            className={`px-5 h-12 md:h-14 rounded-2xl font-medium whitespace-nowrap transition-colors border ${(locationFilter === loc) || (loc === "All" && locationFilter === "")
                                ? "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/40 dark:border-teal-800 dark:text-teal-300"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700/50"
                                }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>

                <Button variant="outline" size="icon" className="hidden md:flex h-14 w-14 rounded-2xl shrink-0 border-slate-200 dark:border-slate-700">
                    <SlidersHorizontal className="h-5 w-5 text-slate-500" />
                </Button>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center px-2">
                <p className="text-slate-500 font-medium">
                    Showing <span className="text-slate-900 dark:text-white font-bold">{filteredGuides.length}</span> guides
                </p>
            </div>

            {/* Results Grid */}
            {filteredGuides.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGuides.map((guide) => (
                        <GuideCard key={guide.id} {...guide} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <MapPin className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No guides found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
                    <Button
                        variant="outline"
                        className="mt-6 rounded-full"
                        onClick={() => { setSearchQuery(""); setLocationFilter("All"); }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
