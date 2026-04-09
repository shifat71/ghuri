"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarX2, Info, MapPin, Plus, X, Search, Navigation } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import dynamic from "next/dynamic";

// Dynamically import Leaflet with SSR disabled
const LeafletMapPicker = dynamic(
    () => import("@/components/maps/LeafletMapPicker"),
    { 
        ssr: false,
        loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center font-bold text-slate-400">Loading Map Engine...</div>
    }
);

export default function GuideCalendarPage() {
    const { user, dbUser, loading } = useAuth();
    const { settings } = useAdminSettings();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Availability State
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    
    // Locations State
    const [guideLocations, setGuideLocations] = useState<string[]>([]);
    const [customLocation, setCustomLocation] = useState("");

    // Exact Map Position State
    const [spots, setSpots] = useState<{lat: number, lng: number, label: string}[]>([]);

    useEffect(() => {
        const fetchGuideData = async () => {
            if (!user?.uid) return;
            try {
                const guideDoc = await getDoc(doc(db, "guides", user.uid));
                if (guideDoc.exists()) {
                    const data = guideDoc.data();
                    // 1. Availability
                    if (data.availableDates) {
                        const dates = data.availableDates.map((ts: string) => new Date(ts));
                        setSelectedDates(dates);
                    } else if (data.unavailableDates) {
                        // Migration fallback
                        const dates = data.unavailableDates.map((ts: string) => new Date(ts));
                        setSelectedDates(dates);
                    }
                    // 2. Locations
                    if (data.locations) {
                        setGuideLocations(data.locations);
                    }
                    // 3. Map Spots
                    if (data.spots && Array.isArray(data.spots)) {
                        setSpots(data.spots);
                    } else if (data.position?.lat && data.position?.lng) {
                        // Migration fallback
                        setSpots([{ 
                            lat: data.position.lat, 
                            lng: data.position.lng, 
                            label: data.formattedAddress || "Primary Location" 
                        }]);
                    }
                }
            } catch (error) {
                console.error("Error fetching guide data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "guide") {
            fetchGuideData();
        }
    }, [user, dbUser]);

    const handleSave = async () => {
        if (!user?.uid) return;
        setIsSaving(true);
        try {
            const timestamps = selectedDates.map(date => date.toISOString());
            const updateObj: any = {
                availableDates: timestamps,
                locations: guideLocations,
                spots: spots,
                updatedAt: new Date()
            };

            // Keep primary position for reverse compatibility
            if (spots.length > 0) {
                updateObj.position = { lat: spots[0].lat, lng: spots[0].lng };
                updateObj.formattedAddress = spots[0].label;
            }

            await updateDoc(doc(db, "guides", user.uid), updateObj);
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to update settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const toggleLocation = (loc: string) => {
        setGuideLocations(prev => 
            prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
        );
    };

    const addCustomLocation = () => {
        if (!customLocation.trim()) return;
        if (!guideLocations.includes(customLocation.trim())) {
            setGuideLocations(prev => [...prev, customLocation.trim()]);
        }
        setCustomLocation("");
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    const destinations = settings.destinations?.length > 0 
        ? settings.destinations.map(d => typeof d === 'string' ? d : d.name)
        : ["Dhaka", "Sylhet", "Cox's Bazar", "Chittagong", "Sajek", "Bandarban", "Rangamati"];

    return (
        <div className="max-w-6xl space-y-8 pb-24">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Service Areas & Availability</h1>
                <p className="text-slate-500">Define where travelers can find you and pinpoint your primary meeting area.</p>
            </div>

            <div className="grid lg:grid-cols-[1fr_380px] gap-8">
                
                <div className="space-y-8">
                    {/* Exact Location Section (The Map) */}
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-200 shadow-sm bg-white overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                                <Navigation className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Service Spots</h2>
                                <p className="text-xs text-slate-500 font-medium italic">Search or click the map to mark multiple meeting points for travelers</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <LeafletMapPicker spots={spots} onChange={setSpots} />
                            
                            {spots.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Selected Points ({spots.length})</p>
                                    <div className="flex flex-wrap gap-2">
                                        {spots.map((spot, i) => (
                                            <div key={i} className="flex items-center gap-2 p-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 group">
                                                <MapPin className="h-3 w-3 text-teal-600 shrink-0" />
                                                <span className="truncate max-w-[150px]">{spot.label}</span>
                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSpots(prev => prev.filter((_, idx) => idx !== i))} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Regional Locations Section */}
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-200 shadow-sm bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Service Districts</h2>
                                <p className="text-xs text-slate-500 font-medium">Select the broader areas where you operate</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {destinations.map((loc: string) => (
                                    <button
                                        key={loc}
                                        onClick={() => toggleLocation(loc)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                            guideLocations.includes(loc)
                                                ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-teal-500"
                                        }`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => {}}
                                className="hidden" // Placeholder for old logic that might be needed elsewhere
                            />

                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Add other location..." 
                                    value={customLocation}
                                    onChange={(e) => setCustomLocation(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomLocation()}
                                    className="rounded-xl h-11"
                                />
                                <Button onClick={addCustomLocation} variant="outline" className="rounded-xl h-11 px-4">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Availability Section */}
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border-slate-200 shadow-sm bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center">
                                <CalendarX2 className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Pick Available Dates</h2>
                                <p className="text-xs text-slate-500 font-medium">Travelers can ONLY book you on the days you select here</p>
                            </div>
                        </div>
                        
                        <div className="flex justify-center">
                            <Calendar
                                mode="multiple"
                                selected={selectedDates}
                                onSelect={setSelectedDates as any}
                                className="rounded-3xl border bg-white p-4 shadow-sm h-fit w-fit"
                            />
                        </div>
                    </Card>
                </div>

                {/* Sidebar Summary & Save */}
                <div className="space-y-6">
                    <Card className="p-8 rounded-[2.5rem] border-slate-200 shadow-xl bg-white sticky top-6">
                        <h3 className="font-black text-xl mb-6 pb-4 border-b">Settings Overview</h3>
                        
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Spots</p>
                                {spots.length > 0 ? (
                                    <div className="space-y-2">
                                        <p className="text-sm font-bold text-teal-600 flex items-center gap-2">
                                            <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">{spots.length} Markers</Badge>
                                        </p>
                                        <div className="text-[10px] text-slate-500 font-medium line-clamp-2">
                                            {spots.map(s => s.label).join(", ")}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-400 italic">No spots marked</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Areas</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {guideLocations.length === 0 ? (
                                        <p className="text-sm text-slate-400 italic">No areas selected</p>
                                    ) : (
                                        guideLocations.map(loc => <Badge key={loc} variant="outline" className="text-[9px] uppercase tracking-tighter">{loc}</Badge>)
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 pb-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Days</p>
                                <p className="text-3xl font-black text-slate-900 leading-none">{selectedDates.length}</p>
                            </div>

                            <Button 
                                onClick={handleSave} 
                                disabled={isSaving} 
                                className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-teal-600 font-black text-white shadow-2xl shadow-indigo-600/30 text-xl transition-all active:scale-95 group"
                            >
                                {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : (
                                    <>Save Settings <Navigation className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
