"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, MapPin, Calendar, Clock, CreditCard, Check, X, MessageCircle } from "lucide-react";

export default function GuideBookingsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, "orders"),
                    where("guideId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setBookings(data);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "guide") fetchBookings();
    }, [user, dbUser]);

    const handleAction = async (bookingId: string, action: 'confirmed' | 'rejected') => {
        try {
            await updateDoc(doc(db, "orders", bookingId), {
                status: action
            });
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: action } : b));
        } catch (error) {
            console.error("Error updating booking:", error);
            alert("Failed to update status");
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    const pending = bookings.filter(b => b.status === "pending");
    const upcoming = bookings.filter(b => b.status === "confirmed");
    const past = bookings.filter(b => b.status === "completed" || b.status === "rejected");

    const BookingCard = ({ booking }: { booking: any }) => (
        <Card className="p-6 rounded-3xl border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
            <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <User className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{booking.customerName || "Traveler"}</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.destination || "Custom"}</span>
                                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Group: {booking.groupSize}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <Badge variant={booking.status === 'pending' ? 'secondary' : booking.status === 'confirmed' ? 'default' : 'outline'}
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                                booking.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' :
                                booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : ''
                            }`}>
                            {booking.status}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</p>
                        <p className="text-sm font-semibold">{booking.startDate?.toDate ? booking.startDate.toDate().toLocaleDateString() : 'TBD'}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Duration</p>
                        <p className="text-sm font-semibold">{booking.duration || 1} Day(s)</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payment</p>
                        <p className="text-sm font-semibold capitalize text-amber-600">{booking.paymentStatus || "unpaid"}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> Payout</p>
                        <p className="text-sm font-semibold text-emerald-600">৳{booking.totalPrice}</p>
                    </div>
                </div>

                {booking.specialRequests && (
                    <div className="bg-slate-50 p-3 rounded-xl text-sm text-slate-600 border border-slate-100 italic">
                        "{booking.specialRequests}"
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center">
                {booking.status === 'pending' ? (
                    <>
                        <Button onClick={() => handleAction(booking.id, 'confirmed')} className="w-full bg-emerald-600 hover:bg-emerald-700 h-10 rounded-xl">
                            <Check className="h-4 w-4 mr-2" /> Accept
                        </Button>
                        <Button onClick={() => handleAction(booking.id, 'rejected')} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 h-10 rounded-xl">
                            <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                    </>
                ) : booking.status === 'confirmed' ? (
                    <Button variant="outline" className="w-full text-teal-700 border-teal-200 hover:bg-teal-50 h-10 rounded-xl font-bold bg-teal-50/50">
                        <MessageCircle className="h-4 w-4 mr-2" /> Chat with Traveler
                    </Button>
                ) : (
                    <Button variant="ghost" disabled className="w-full h-10 rounded-xl bg-slate-50 text-slate-400 font-medium">
                        Closed
                    </Button>
                )}
            </div>
        </Card>
    );

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Bookings</h1>
                <p className="text-slate-500">Manage your tour requests, communicate with travelers, and view your schedule.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-6 flex space-x-2 w-fit">
                    <TabsTrigger value="pending" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Pending ({pending.length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Upcoming ({upcoming.length})
                    </TabsTrigger>
                    <TabsTrigger value="past" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm text-slate-500">
                        Past
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pending.length > 0 ? pending.map(b => <BookingCard key={b.id} booking={b} />) : (
                        <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
                            <p className="text-slate-500">No pending booking requests right now.</p>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-4">
                    {upcoming.length > 0 ? upcoming.map(b => <BookingCard key={b.id} booking={b} />) : (
                        <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
                            <p className="text-slate-500">You have no upcoming tours.</p>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="past" className="space-y-4">
                    {past.length > 0 ? past.map(b => <BookingCard key={b.id} booking={b} />) : (
                        <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/50">
                            <p className="text-slate-500">No past bookings found.</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
