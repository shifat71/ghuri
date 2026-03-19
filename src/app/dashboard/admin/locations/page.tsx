"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin, Plus, Trash2, Save, Image as ImageIcon } from "lucide-react";

export default function AdminLocationsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [destinations, setDestinations] = useState<any[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                const docRef = doc(db, "admin_settings", "global");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().destinations) {
                    setDestinations(docSnap.data().destinations);
                } else {
                    // Initialize with defaults if empty
                    setDestinations([
                        { id: 1, name: "Sylhet", category: "Hill & Tea Gardens", image: "" },
                        { id: 2, name: "Cox's Bazar", category: "Beach", image: "" },
                        { id: 3, name: "Sundarbans", category: "Forest & Wildlife", image: "" }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching locations:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchLocations();
    }, [user, dbUser]);

    const handleAdd = () => {
        setDestinations([
            ...destinations, 
            { id: Date.now(), name: "", category: "City", image: "" }
        ]);
    };

    const handleRemove = (id: number) => {
        setDestinations(destinations.filter(d => d.id !== id));
    };

    const handleUpdate = (id: number, field: string, value: string) => {
        setDestinations(destinations.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "admin_settings", "global"), {
                destinations: destinations
            });
            alert("Destinations updated successfully!");
        } catch (error) {
            console.error("Error saving destinations:", error);
            alert("Failed to save locations.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="max-w-5xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Location Management</h1>
                    <p className="text-slate-500">Manage the official list of destinations available on Ghuri.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold min-w-[150px]">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </Button>
            </div>

            <Card className="p-6 md:p-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                        Destinations & Categories
                    </h3>
                    <Button onClick={handleAdd} variant="outline" className="rounded-xl flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Plus className="h-4 w-4" /> Add Destination
                    </Button>
                </div>

                <div className="space-y-4">
                    {destinations.length === 0 ? (
                        <div className="text-center py-12 border border-dashed rounded-2xl border-slate-200">
                            <p className="text-slate-500">No destinations configured.</p>
                        </div>
                    ) : destinations.map((dest) => (
                        <div key={dest.id} className="grid md:grid-cols-12 gap-4 items-start p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl relative group">
                            
                            <div className="md:col-span-2">
                                <div className="h-20 w-full bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center relative">
                                    {dest.image ? (
                                        <img src={dest.image} alt={dest.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-slate-400" />
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-10 grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Destination Name</Label>
                                    <Input 
                                        value={dest.name} 
                                        onChange={(e) => handleUpdate(dest.id, 'name', e.target.value)}
                                        placeholder="e.g. Sajek Valley"
                                        className="h-10 bg-white dark:bg-slate-900 border-slate-200 shadow-sm rounded-lg" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Category / Tag</Label>
                                    <select
                                        value={dest.category}
                                        onChange={(e) => handleUpdate(dest.id, 'category', e.target.value)}
                                        className="flex h-10 w-full rounded-lg border-slate-200 shadow-sm bg-white dark:bg-slate-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    >
                                        <option value="City">City & Culture</option>
                                        <option value="Beach">Beach & Sea</option>
                                        <option value="Hill">Hill & Tea Gardens</option>
                                        <option value="Forest">Forest & Wildlife</option>
                                        <option value="Historical">Historical Sites</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500 tracking-wider">Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            value={dest.image} 
                                            onChange={(e) => handleUpdate(dest.id, 'image', e.target.value)}
                                            placeholder="https://..."
                                            className="h-10 bg-white dark:bg-slate-900 border-slate-200 shadow-sm rounded-lg flex-1" 
                                        />
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleRemove(dest.id)}
                                            className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
