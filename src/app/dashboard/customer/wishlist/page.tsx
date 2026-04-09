"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Heart, Loader2, MapPin, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BookingModal from "@/components/booking/BookingModal";

export default function CustomerWishlistPage() {
    const { user, loading } = useAuth();
    const [savedGuides, setSavedGuides] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedGuide, setSelectedGuide] = useState<any | null>(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user?.uid) return;
            try {
                const userSnap = await getDoc(doc(db, "users", user.uid));
                const savedIds: string[] = userSnap.data()?.savedGuides || [];
                const guides = await Promise.all(
                    savedIds.map(async (id) => {
                        const snap = await getDoc(doc(db, "guides", id));
                        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
                    })
                );
                setSavedGuides(guides.filter(Boolean));
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchWishlist();
    }, [user]);

    const handleRemove = async (guideId: string) => {
        setSavedGuides(prev => prev.filter(g => g.id !== guideId));
        const userRef = doc(db, "users", user!.uid);
        const current = (await getDoc(userRef)).data()?.savedGuides || [];
        await updateDoc(userRef, { savedGuides: current.filter((id: string) => id !== guideId) });
    };

    if (loading || isLoading) return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Wishlist</h1>
                <p className="text-slate-500">Your saved guides, ready to book when inspiration strikes.</p>
            </div>

            {savedGuides.length === 0 ? (
                <Card className="p-16 text-center rounded-3xl border-dashed border-slate-200">
                    <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="font-bold text-slate-700 mb-1">Your wishlist is empty</p>
                    <p className="text-sm text-slate-500">Save guides from the Explore page by clicking the heart icon.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {savedGuides.map(guide => (
                        <Card key={guide.id} className="p-5 rounded-3xl border-slate-200 shadow-sm flex gap-4 items-start">
                            <div className="h-16 w-16 rounded-2xl bg-teal-100 shrink-0 flex items-center justify-center overflow-hidden">
                                {guide.avatarUrl
                                    ? <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                                    : <span className="text-teal-700 font-black text-2xl">{guide.name?.[0]}</span>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black truncate">{guide.name || "Unknown Guide"}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                    {guide.rating > 0 && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />{guide.rating.toFixed(1)}</span>}
                                    {guide.locations?.length > 0 && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{guide.locations[0]}</span>}
                                    {guide.serviceCharge && <span className="font-bold text-teal-600">৳{guide.serviceCharge}/day</span>}
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <Button onClick={() => setSelectedGuide(guide)} size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs">Book Now</Button>
                                    <Button onClick={() => handleRemove(guide.id)} size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 rounded-xl text-xs">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {selectedGuide && <BookingModal guide={selectedGuide} onClose={() => setSelectedGuide(null)} />}
        </div>
    );
}
