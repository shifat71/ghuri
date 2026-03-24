"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, DollarSign, TrendingUp, Zap, Save } from "lucide-react";

export default function GuideServicesPage() {
    const { user, dbUser, loading } = useAuth();
    const { settings, loading: settingsLoading } = useAdminSettings();
    const [serviceCharge, setServiceCharge] = useState<number>(settings.minCharge);
    const [isSaving, setIsSaving] = useState(false);
    const [savedCharge, setSavedCharge] = useState<number | null>(null);

    const effectiveCharge = Math.min(Math.max(serviceCharge, settings.minCharge), settings.maxCharge);
    const platformFee = Math.round(effectiveCharge * (settings.commissionPercent / 100));
    const guideEarning = effectiveCharge - platformFee;
    const competitiveness = Math.round(((settings.maxCharge - effectiveCharge) / (settings.maxCharge - settings.minCharge)) * 100);

    const handleSave = async () => {
        if (!user?.uid) return;
        setIsSaving(true);
        try {
            await updateDoc(doc(db, "guides", user.uid), {
                serviceCharge: effectiveCharge,
            });
            setSavedCharge(effectiveCharge);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || settingsLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Service Charge</h1>
                <p className="text-slate-500">Set your daily rate. Admin controls the allowed range — this updates live.</p>
            </div>

            {/* Live sync notice */}
            <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl text-sm">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
                <span className="text-teal-700 dark:text-teal-400 font-medium">
                    Allowed range is live-synced from Admin: <strong>৳{settings.minCharge} – ৳{settings.maxCharge}</strong>
                </span>
            </div>

            <Card className="p-6 md:p-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                {/* Slider */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Your Daily Rate</label>
                        <span className="text-2xl font-black text-teal-600">৳{effectiveCharge.toLocaleString()}</span>
                    </div>
                    <input
                        type="range"
                        min={settings.minCharge}
                        max={settings.maxCharge}
                        step={50}
                        value={effectiveCharge}
                        onChange={(e) => setServiceCharge(Number(e.target.value))}
                        className="w-full h-2 accent-teal-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>৳{settings.minCharge}</span>
                        <span>৳{settings.maxCharge}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-slate-500 shrink-0">Or type a value:</label>
                        <Input
                            type="number"
                            min={settings.minCharge}
                            max={settings.maxCharge}
                            value={serviceCharge}
                            onChange={(e) => setServiceCharge(Number(e.target.value))}
                            className="max-w-[140px] h-10 rounded-xl font-bold text-center"
                        />
                    </div>
                </div>

                {/* Breakdown */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Earnings Breakdown</h3>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Traveler pays</span>
                        <span className="font-bold">৳{effectiveCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-medium">Platform fee ({settings.commissionPercent}%)</span>
                        <span className="font-bold text-red-500">−৳{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-slate-200 dark:border-slate-700 pt-3 mt-1">
                        <span className="font-bold text-slate-700 dark:text-slate-200">You earn</span>
                        <span className="font-black text-teal-600 text-lg">৳{guideEarning.toLocaleString()}</span>
                    </div>
                </div>

                {/* Competitiveness */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" /> Competitiveness Score
                        </span>
                        <span className={`text-sm font-black ${competitiveness > 60 ? 'text-emerald-600' : competitiveness > 30 ? 'text-amber-500' : 'text-red-500'}`}>
                            {competitiveness}%
                        </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${competitiveness > 60 ? 'bg-emerald-500' : competitiveness > 30 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${competitiveness}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                        {competitiveness > 60 ? 'Great! Your rate is competitive and likely to attract more bookings.' :
                         competitiveness > 30 ? 'Your rate is above average. Consider lowering slightly for more bookings.' :
                         'Your rate is near the maximum. You may see fewer inquiries.'}
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-md shadow-teal-600/20"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    Save Rate
                </Button>

                {savedCharge !== null && (
                    <p className="text-center text-sm text-emerald-600 font-semibold">
                        ✓ Saved — ৳{savedCharge}/day is now visible to customers.
                    </p>
                )}
            </Card>
        </div>
    );
}
