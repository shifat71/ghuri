"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Loader2, Users, MapPin, DollarSign, TrendingUp, BarChart3, AlertCircle } from "lucide-react";

export default function AdminOverviewPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeGuides: 0,
        pendingGuides: 0,
        platformRevenue: 0,
        totalBookings: 0,
    });

    useEffect(() => {
        const fetchAdminStats = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                // Fetch Guides
                const guidesSnap = await getDocs(collection(db, "guides"));
                const guides = guidesSnap.docs.map(doc => doc.data());
                
                // Fetch Orders
                const ordersSnap = await getDocs(collection(db, "orders"));
                const orders = ordersSnap.docs.map(doc => doc.data());

                let revenue = 0;
                orders.forEach(order => {
                    if (order.status === 'completed' || order.status === 'confirmed') {
                        // Assuming platform fee is 10% if not explicitly set
                        const fee = order.platformFee || (Number(order.totalPrice) * 0.1);
                        revenue += fee;
                    }
                });

                setStats({
                    totalUsers: guides.length * 5, // Mock multiplier for actual users count
                    activeGuides: guides.filter(g => g.nogoriStatus === 'verified' || g.nogoriStatus === 'pro').length,
                    pendingGuides: guides.filter(g => g.nogoriStatus === 'pending').length,
                    platformRevenue: revenue,
                    totalBookings: orders.length,
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchAdminStats();
    }, [user, dbUser]);

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    return (
        <div className="max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Platform Overview</h1>
                    <p className="text-slate-500">Monitor Ghuri's growth, revenue, and active community.</p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border px-4 py-2 rounded-xl shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-wider">LIVE DATA</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <span className="font-bold tracking-wider text-sm opacity-90">Total Revenue</span>
                    </div>
                    <div>
                        <p className="text-4xl font-black">৳{stats.platformRevenue.toLocaleString()}</p>
                        <p className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +14% this month</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-bold tracking-wider text-sm uppercase">Active Guides</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-4xl font-black">{stats.activeGuides}</p>
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900 shadow-sm flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-200 dark:bg-amber-800 rounded-bl-[100px] opacity-20 transition-transform group-hover:scale-110"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3 text-amber-900 dark:text-amber-500">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center shrink-0">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <span className="font-bold tracking-wider text-sm uppercase">Pending Approvals</span>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-end justify-between">
                        <p className="text-4xl font-black text-amber-600 dark:text-amber-400">{stats.pendingGuides}</p>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-200 px-2 py-1 rounded-md">Action Required</span>
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="font-bold tracking-wider text-sm uppercase">Total Bookings</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-4xl font-black">{stats.totalBookings}</p>
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> All time</p>
                    </div>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-teal-600" />
                            Trending Destinations
                        </h3>
                    </div>
                    <div className="space-y-6">
                        {/* Mock Trending Data */}
                        {[
                            { name: "Sylhet", percentage: 45, bookings: 124 },
                            { name: "Cox's Bazar", percentage: 30, bookings: 86 },
                            { name: "Bandarban", percentage: 15, bookings: 42 },
                            { name: "Saint Martin", percentage: 10, bookings: 21 },
                        ].map((dest, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex items-center justify-between text-sm font-bold">
                                    <span>{dest.name}</span>
                                    <span className="text-slate-500">{dest.bookings} Bookings</span>
                                </div>
                                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-teal-500 rounded-full"
                                        style={{ width: `${dest.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm min-h-[350px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-indigo-600" />
                            Revenue Forecast
                        </h3>
                    </div>
                    <div className="h-48 flex items-end gap-2 md:gap-4 pt-4">
                        {/* Mock Chart */}
                        {[30, 50, 45, 70, 85, 100].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                <div className="w-full flex justify-center h-full relative">
                                    <div 
                                        className="w-full max-w-[32px] bg-indigo-100 dark:bg-indigo-900/40 rounded-t-xl group-hover:bg-indigo-500 transition-colors absolute bottom-0"
                                        style={{ height: `${val}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">M{i+1}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
