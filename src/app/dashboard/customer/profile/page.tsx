"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, User, Phone, MapPin, Save, CheckCircle2 } from "lucide-react";

const TRAVEL_PREFS = ["Beach", "Hill & Trekking", "Cultural", "Food Tour", "Photography", "Wildlife", "City Tour", "Adventure"];

export default function CustomerProfilePage() {
    const { user, loading } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [location, setLocation] = useState("");
    const [preferences, setPreferences] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user?.uid) return;
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    setDisplayName(data.displayName || user.displayName || "");
                    setPhoneNumber(data.phoneNumber || "");
                    setLocation(data.location || "");
                    setPreferences(data.travelPreferences || []);
                }
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        if (user) fetchProfile();
    }, [user]);

    const togglePref = (pref: string) => {
        setPreferences(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]);
    };

    const handleSave = async () => {
        if (!user?.uid) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "users", user.uid), { displayName, phoneNumber, location, travelPreferences: preferences, updatedAt: new Date() });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) { console.error(err); }
        finally { setIsSaving(false); }
    };

    if (loading || isLoading) return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Profile Settings</h1>
                <p className="text-slate-500">Manage your personal information and travel preferences.</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-5">
                <div className="h-20 w-20 rounded-3xl bg-teal-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-teal-600/30">
                    {user?.photoURL
                        ? <img src={user.photoURL} alt="avatar" className="h-full w-full object-cover rounded-3xl" />
                        : (displayName || user?.email || "U")[0].toUpperCase()
                    }
                </div>
                <div>
                    <p className="font-black text-lg">{displayName || user?.email}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
            </div>

            <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Personal Information</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="Your full name" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="+880..." />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-1.5">Your City</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input value={location} onChange={e => setLocation(e.target.value)} className="pl-10 h-11 rounded-xl" placeholder="Dhaka, Chittagong..." />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider mb-3">Travel Preferences</h3>
                    <p className="text-sm text-slate-500 mb-4">Help us recommend the right guides for you.</p>
                    <div className="flex flex-wrap gap-2">
                        {TRAVEL_PREFS.map(pref => (
                            <button key={pref} onClick={() => togglePref(pref)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${preferences.includes(pref)
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-600/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-700 hover:border-teal-400'}`}>
                                {pref}
                            </button>
                        ))}
                    </div>
                </div>

                <Button onClick={handleSave} disabled={isSaving} className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-600/20">
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : saved ? <CheckCircle2 className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    {saved ? 'Saved!' : 'Save Profile'}
                </Button>
            </Card>
        </div>
    );
}
