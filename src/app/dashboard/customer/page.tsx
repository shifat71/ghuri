"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Compass, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CustomerDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // Auth Guard
    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "customer") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    // Fetch Orders
    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const q = query(
                    collection(db, "orders"),
                    where("customerId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const ordersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        if (user && dbUser?.role === "customer") {
            fetchOrders();
        }
    }, [user, dbUser]);

    if (loading || dbUser?.role !== "customer") return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Trips</h1>
                    <p className="text-slate-500">Manage your upcoming and past adventures.</p>
                </div>
                <Link href="/guides">
                    <Button className="rounded-xl flex items-center gap-2">
                        <Compass className="h-4 w-4" />
                        Find New Guide
                    </Button>
                </Link>
            </div>

            {isLoadingOrders ? (
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="w-full h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                'bg-slate-100 text-slate-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-slate-500 text-sm flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {order.startDate?.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trip with Guide #{order.guideId.substring(0, 5)}</h3>
                                <p className="text-slate-500 text-sm mt-1">Total: ৳{order.totalPrice}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="rounded-xl">View Details</Button>
                                {order.whatsappMessageId && (
                                    <Button className="bg-[#25D366] hover:bg-[#1DA851] text-white rounded-xl">Open WhatsApp</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No trips yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">You haven't booked any experiences yet. Browse our verified local guides to start your next adventure.</p>
                    <Link href="/guides">
                        <Button size="lg" className="rounded-xl">Explore Guides</Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
