"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarCheck, MapPin, Search, EyeOff, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminBookingsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchBookings();
    }, [user, dbUser]);

    const handleForceCancel = async (bookingId: string) => {
        if (!confirm("Are you sure you want to forcibly cancel this booking? This action cannot be easily undone.")) return;
        
        try {
            await updateDoc(doc(db, "orders", bookingId), {
                status: 'cancelled_by_admin'
            });
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled_by_admin' } : b));
        } catch (error) {
            console.error("Error cancelling booking:", error);
            alert("Failed to cancel booking");
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    const filteredBookings = bookings.filter(b => 
        (b.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (b.guideName || b.guideId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.id || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Booking Oversight</h1>
                    <p className="text-slate-500">Monitor all platform transactions and resolve disputes.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search by ID, User, or Guide..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-white rounded-xl border-slate-200 shadow-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredBookings.length === 0 ? (
                    <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No bookings match your search.</p>
                    </Card>
                ) : filteredBookings.map((booking) => (
                    <Card key={booking.id} className="p-6 rounded-3xl border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 border rounded-full bg-slate-50 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                        #{booking.id?.substring(0,3).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{booking.customerName || "Customer"} <span className="text-slate-400 font-normal mx-2">booking</span> {booking.guideName || "Guide"}</h3>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.destination || "Custom"}</span>
                                            <span className="flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> Date: {booking.startDate?.toDate ? booking.startDate.toDate().toLocaleDateString() : 'TBD'}</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                    booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                    booking.status === 'cancelled_by_admin' ? 'bg-red-100 text-red-800 border-red-200' :
                                    'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                    {booking.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Value</p>
                                    <p className="text-sm font-semibold">৳{booking.totalPrice}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Payment Status</p>
                                    <p className={`text-sm font-semibold capitalize ${booking.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {booking.paymentStatus || 'pending'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Created</p>
                                    <p className="text-sm font-semibold">{booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : 'Unknown'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[150px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center">
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                <Button 
                                    onClick={() => handleForceCancel(booking.id)} 
                                    variant="outline" 
                                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <EyeOff className="h-4 w-4 mr-2" /> Force Cancel
                                </Button>
                            )}
                            <Button variant="ghost" className="w-full">
                                View Details
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
