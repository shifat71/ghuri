"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGuideAvailability } from "@/hooks/useGuideAvailability";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Button } from "@/components/ui/button";
import { Loader2, X, MapPin, Star, BadgeCheck, DollarSign, CalendarCheck } from "lucide-react";

interface Guide {
    id: string;
    name: string;
    tagline?: string;
    avatarUrl?: string;
    locations: string[];
    rating: number;
    serviceCharge?: number;
    nogoriStatus: string;
}

interface BookingModalProps {
    guide: Guide;
    onClose: () => void;
}

export default function BookingModal({ guide, onClose }: BookingModalProps) {
    const { user, dbUser } = useAuth();
    const { unavailableDates, serviceCharge, loading: availLoading } = useGuideAvailability(guide.id);
    const { settings } = useAdminSettings();

    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [specialRequests, setSpecialRequests] = useState("");
    const [groupSize, setGroupSize] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const price = serviceCharge ?? guide.serviceCharge ?? settings.minCharge;
    const platformFee = Math.round(price * (settings.commissionPercent / 100));

    const handleBook = async () => {
        if (!user || !selectedDate) return;
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerId: user.uid,
                    customerName: user.displayName || dbUser?.displayName,
                    guideId: guide.id,
                    startDate: selectedDate.toISOString(),
                    specialRequests,
                    groupSize,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Booking failed.");
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-teal-100 flex items-center justify-center shrink-0">
                            {guide.avatarUrl
                                ? <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                                : <span className="text-teal-700 font-black text-xl">{guide.name[0]}</span>
                            }
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="font-black text-slate-900">{guide.name}</h2>
                                {(guide.nogoriStatus === 'verified' || guide.nogoriStatus === 'pro') && (
                                    <BadgeCheck className="h-4 w-4 text-teal-600" />
                                )}
                            </div>
                            {guide.tagline && <p className="text-sm text-slate-500">{guide.tagline}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {success ? (
                    <div className="p-12 text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                            <CalendarCheck className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Booking Sent!</h3>
                        <p className="text-slate-500">Your request has been sent to {guide.name}. You'll be notified once they confirm.</p>
                        <Button onClick={onClose} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-8">Done</Button>
                    </div>
                ) : (
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Calendar Column */}
                        <div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Select Date</p>
                            {availLoading ? (
                                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal-600" /></div>
                            ) : (
                                <div className="border border-slate-100 rounded-2xl overflow-hidden p-1">
                                    <DayPicker
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={[{ before: new Date() }, ...unavailableDates.map(d => new Date(d))]}
                                        classNames={{
                                            day_selected: "!bg-teal-600 !text-white !font-bold",
                                            day_disabled: "!opacity-30 !line-through",
                                        }}
                                    />
                                </div>
                            )}
                            {unavailableDates.length > 0 && (
                                <p className="text-xs text-slate-400 mt-2">Greyed-out dates are unavailable.</p>
                            )}
                        </div>

                        {/* Details Column */}
                        <div className="space-y-5">
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Trip Details</p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Group Size</label>
                                        <input type="number" min={1} max={20} value={groupSize}
                                            onChange={e => setGroupSize(Number(e.target.value))}
                                            className="w-full h-10 px-3 border border-slate-200 rounded-xl bg-white text-sm font-bold" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Special Requests</label>
                                        <textarea rows={3} value={specialRequests}
                                            onChange={e => setSpecialRequests(e.target.value)}
                                            placeholder="Any preferences, dietary needs, accessibility requirements..."
                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm resize-none" />
                                    </div>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Breakdown</p>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Guide rate / day</span><span className="font-bold">৳{price.toLocaleString()}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-slate-500">Platform fee</span><span className="font-bold text-slate-400">৳{platformFee.toLocaleString()}</span></div>
                                <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
                                    <span className="font-bold">Total</span>
                                    <span className="text-teal-600 font-black text-lg">৳{price.toLocaleString()}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={handleBook}
                                disabled={!selectedDate || isSubmitting || availLoading}
                                className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-base shadow-md shadow-teal-600/20"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                {!selectedDate ? 'Select a Date First' : `Confirm Booking — ৳${price.toLocaleString()}`}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
