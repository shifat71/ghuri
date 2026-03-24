"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CustomerTripCard } from "@/components/dashboard/CustomerTripCard";

function EmptyState({ label }: { label: string }) {
    return (
        <Card className="p-14 text-center rounded-3xl border-dashed border-slate-200 dark:border-slate-700">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No {label} trips.</p>
        </Card>
    );
}

export default function CustomerTripsPage() {
    const { user, loading } = useAuth();
    const { orders, loading: ordersLoading } = useOrders('customer');

    if (loading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    const pending = orders.filter(o => o.status === 'pending');
    const upcoming = orders.filter(o => o.status === 'confirmed');
    const ongoing = orders.filter(o => o.status === 'in_progress');
    const completed = orders.filter(o => o.status === 'completed');

    const handleCancel = async (orderId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await updateDoc(doc(db, "orders", orderId), { status: 'cancelled', updatedAt: new Date() });
        } catch (err) {
            console.error("Cancel error:", err);
        }
    };

    const handleReview = (orderId: string) => {
        console.log("Review for:", orderId);
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Trips</h1>
                <p className="text-slate-500">Manage all your upcoming and past adventures.</p>
            </div>

            {ordersLoading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-32 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
            ) : (
                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-2xl flex flex-wrap gap-1 h-auto w-fit mb-6">
                        <TabsTrigger value="upcoming" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Upcoming {upcoming.length > 0 && <span className="ml-2 bg-teal-100 text-teal-700 text-xs font-bold px-1.5 py-0.5 rounded-md">{upcoming.length}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Pending {pending.length > 0 && <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-1.5 py-0.5 rounded-md">{pending.length}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="ongoing" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Ongoing</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-xl px-4 data-[state=active]:bg-white data-[state=active]:shadow-sm">Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                        {upcoming.length === 0 ? <EmptyState label="upcoming" /> : upcoming.map(o => <CustomerTripCard key={o.id} order={o} onCancel={handleCancel} onReview={handleReview} />)}
                    </TabsContent>
                    <TabsContent value="pending" className="space-y-4">
                        {pending.length === 0 ? <EmptyState label="pending" /> : pending.map(o => <CustomerTripCard key={o.id} order={o} onCancel={handleCancel} onReview={handleReview} />)}
                    </TabsContent>
                    <TabsContent value="ongoing" className="space-y-4">
                        {ongoing.length === 0 ? <EmptyState label="ongoing" /> : ongoing.map(o => <CustomerTripCard key={o.id} order={o} onCancel={handleCancel} onReview={handleReview} />)}
                    </TabsContent>
                    <TabsContent value="completed" className="space-y-4">
                        {completed.length === 0 ? <EmptyState label="completed" /> : completed.map(o => <CustomerTripCard key={o.id} order={o} onCancel={handleCancel} onReview={handleReview} />)}
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
