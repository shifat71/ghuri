"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, getDocs, doc, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, DollarSign, ArrowRightLeft, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminPayoutsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchPayouts = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                // Fetch confirmed/completed orders needing payout tracking
                const q = query(collection(db, "orders"), where("status", "in", ["completed", "confirmed"]));
                const snapshot = await getDocs(q);
                let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                
                // Sort by unpaid first
                data.sort((a,b) => {
                    if (a.paymentStatus === 'pending_payout' && b.paymentStatus !== 'pending_payout') return -1;
                    if (a.paymentStatus !== 'pending_payout' && b.paymentStatus === 'pending_payout') return 1;
                    return 0;
                });
                
                setOrders(data);
            } catch (error) {
                console.error("Error fetching payouts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchPayouts();
    }, [user, dbUser]);

    const handleApprovePayout = async (orderId: string) => {
        if (!confirm("Confirm that funds have been transferred to the guide's bank/mobile account?")) return;
        
        try {
            await updateDoc(doc(db, "orders", orderId), {
                paymentStatus: 'paid_out'
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: 'paid_out' } : o));
        } catch (error) {
            console.error("Error updating payout:", error);
            alert("Failed to process payout");
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    const pendingPayouts = orders.filter(o => o.paymentStatus === 'pending_payout' || o.paymentStatus === 'unpaid');
    const completedPayouts = orders.filter(o => o.paymentStatus === 'paid_out');

    const PayoutCard = ({ order }: { order: any }) => {
        const platformFee = order.platformFee || (Number(order.totalPrice) * 0.1);
        const guideEarning = order.guideEarning || (Number(order.totalPrice) - platformFee);

        return (
            <Card className="p-6 rounded-3xl border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-slate-600">Traveler: {order.customerName || "Customer"}</span>
                                <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                                <span className="font-bold text-indigo-700 dark:text-indigo-400">Guide: {order.guideName || "Guide"}</span>
                            </div>
                            <div className="text-xs text-slate-500">Order #{order.id} • {order.destination || "Custom Tour"}</div>
                        </div>
                        <Badge variant="outline" className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                            order.paymentStatus === 'paid_out' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                            {order.paymentStatus === 'paid_out' ? 'Settled' : 'Pending'}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-slate-100 bg-slate-50/50 rounded-xl px-4">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total Paid by User</p>
                            <p className="text-base font-semibold">৳{order.totalPrice}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-wider">Platform Cut</p>
                            <p className="text-base font-semibold text-indigo-600">৳{platformFee}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Guide Payout</p>
                            <p className="text-base font-black text-emerald-600">৳{guideEarning}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[160px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 justify-center">
                    {order.paymentStatus !== 'paid_out' ? (
                        <>
                            <div className="text-xs font-bold text-center text-amber-600 mb-2 truncate">Due: ৳{guideEarning}</div>
                            <Button onClick={() => handleApprovePayout(order.id)} className="w-full bg-indigo-600 hover:bg-indigo-700 h-10 rounded-xl shadow-md shadow-indigo-600/20">
                                Mark as Paid
                            </Button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-emerald-600 gap-2">
                            <CheckCircle2 className="h-8 w-8" />
                            <span className="text-sm font-bold uppercase tracking-wider">Settled</span>
                        </div>
                    )}
                </div>
            </Card>
        );
    }

    return (
        <div className="max-w-6xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Payout Control</h1>
                <p className="text-slate-500">Track incoming platform revenue and dispatch guide payments.</p>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-6 flex space-x-2 w-fit">
                    <TabsTrigger value="pending" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-700">
                        Pending Payouts ({pendingPayouts.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Settled History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                    {pendingPayouts.length === 0 ? (
                        <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500">All guides are fully paid up. No pending payouts.</p>
                        </Card>
                    ) : pendingPayouts.map((order) => <PayoutCard key={order.id} order={order} />)}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {completedPayouts.length === 0 ? (
                        <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500">No payout history available.</p>
                        </Card>
                    ) : completedPayouts.map((order) => <PayoutCard key={order.id} order={order} />)}
                </TabsContent>
            </Tabs>
        </div>
    );
}
