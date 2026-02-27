"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ShieldAlert, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GuideDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [guideProfile, setGuideProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);

    // Auth Guard
    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "guide") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    // Fetch Profile & Incoming Orders
    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                // Fetch Guide Profile
                const profileDoc = await getDoc(doc(db, "guides", user.uid));
                if (profileDoc.exists()) {
                    setGuideProfile(profileDoc.data());
                }

                // Fetch Incoming Orders
                const q = query(
                    collection(db, "orders"),
                    where("guideId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const ordersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setOrders(ordersData);

            } catch (error) {
                console.error("Error fetching guide data:", error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        if (user && dbUser?.role === "guide") {
            fetchData();
        }
    }, [user, dbUser]);

    if (loading || dbUser?.role !== "guide" || isLoadingPage) return null;

    const isVerified = guideProfile?.nogoriStatus === 'verified' || guideProfile?.nogoriStatus === 'pro';

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Guide Dashboard</h1>
                <p className="text-slate-500">Manage your profile, services, and incoming booking requests.</p>
            </div>

            {/* Verification Warning */}
            {!isVerified && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <ShieldAlert className="h-10 w-10 text-amber-500 shrink-0" />
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500">Your profile is pending Nogori Verification</h3>
                        <p className="text-amber-700 dark:text-amber-400 mt-1">Travelers cannot book you until an admin verifies your identity and references. Please ensure you have emailed your documents to info@ghuri.com.</p>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Verification Status</p>
                        <p className="text-xl font-bold capitalize">{guideProfile?.nogoriStatus}</p>
                    </div>
                </Card>
                <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Trips</p>
                        <p className="text-xl font-bold">{guideProfile?.totalTrips || 0}</p>
                    </div>
                </Card>
                <Card className="p-6 rounded-2xl border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Requests</p>
                        <p className="text-xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <h2 className="text-xl font-bold mb-4">Incoming Requests</h2>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                                                'bg-slate-100 text-slate-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-slate-500 text-sm">{order.startDate?.toDate().toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold">Booking by {order.customerName}</h3>
                                <p className="text-slate-500 text-sm mt-1 mb-2">Group Size: {order.groupSize} | Total: ৳{order.totalPrice}</p>
                                {order.specialRequests && (
                                    <div className="bg-slate-50 text-slate-700 p-3 rounded-lg text-sm border border-slate-100">
                                        <span className="font-semibold block mb-1">Message:</span>
                                        {order.specialRequests}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col gap-2 min-w-[120px]">
                                {order.status === 'pending' && (
                                    <Button className="w-full bg-teal-600 hover:bg-teal-700">Accept</Button>
                                )}
                                {order.whatsappMessageId ? (
                                    <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50">Opening Chat...</Button>
                                ) : (
                                    <Button variant="outline" className="w-full">View Details</Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-500">No booking requests yet. Make sure your profile looks great!</p>
                </Card>
            )}

        </div>
    );
}
