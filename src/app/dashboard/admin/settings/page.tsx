"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Loader2, Settings2, Percent, DollarSign, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState({
        minCharge: 500,
        maxCharge: 5000,
        commissionPercent: 10,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                const settingsDoc = await getDoc(doc(db, "admin_settings", "global"));
                if (settingsDoc.exists()) {
                    setSettings({ ...settings, ...settingsDoc.data() });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchSettings();
    }, [user, dbUser]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await setDoc(doc(db, "admin_settings", "global"), settings, { merge: true });
            alert("Settings updated successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Platform Settings & Pricing</h1>
                <p className="text-slate-500">Configure global service charges and commission percentages.</p>
            </div>

            <form onSubmit={handleSave}>
                <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 space-y-8">

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Guide Service Charge Range</h3>
                                    <p className="text-sm text-slate-500">Guides must set their daily rate within these limits.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl gap-6 md:grid-cols-2">
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Minimum Daily Rate (৳)</Label>
                                    <Input
                                        type="number"
                                        required
                                        min={0}
                                        value={settings.minCharge}
                                        onChange={(e) => setSettings({ ...settings, minCharge: Number(e.target.value) })}
                                        className="h-12 text-lg font-bold bg-white dark:bg-slate-950 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Maximum Daily Rate (৳)</Label>
                                    <Input
                                        type="number"
                                        required
                                        min={settings.minCharge}
                                        value={settings.maxCharge}
                                        onChange={(e) => setSettings({ ...settings, maxCharge: Number(e.target.value) })}
                                        className="h-12 text-lg font-bold bg-white dark:bg-slate-950 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                    <Percent className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Platform Commission</h3>
                                    <p className="text-sm text-slate-500">Percentage deducted from guide earnings per booking.</p>
                                </div>
                            </div>

                            <div className="max-w-xs space-y-4">
                                <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">Commission Rate (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    required
                                    value={settings.commissionPercent}
                                    onChange={(e) => setSettings({ ...settings, commissionPercent: Number(e.target.value) })}
                                    className="h-12 text-lg font-bold rounded-xl"
                                />
                                <p className="text-xs text-slate-500 font-medium">Currently taking {settings.commissionPercent}% from every transaction.</p>
                            </div>
                        </div>

                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button type="submit" disabled={isSaving} className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold min-w-[150px]">
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Configuration"}
                        </Button>
                    </div>
                </Card>
            </form>

        </div>
    );
}
