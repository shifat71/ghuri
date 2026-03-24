"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Wallet2, History, ArrowDownToLine, TrendingUp } from "lucide-react";

export default function GuideEarningsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        pendingPayouts: 0,
    });
    const [completedBookings, setCompletedBookings] = useState<any[]>([]);

    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.uid) return;
            try {
                // Fetch completed orders to sum up earnings
                const q = query(
                    collection(db, "orders"),
                    where("guideId", "==", user.uid),
                    where("status", "in", ["completed", "confirmed"])
                );
                const snapshot = await getDocs(q);
                let total = 0;
                let monthly = 0;
                let pending = 0;
                const pastBookings: any[] = [];

                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                snapshot.forEach((doc) => {
                    const data = doc.data();
                    const amount = Number(data.totalPrice) || 0;
                    
                    pastBookings.push({ id: doc.id, ...data });

                    // Assume guide earns 90% (10% platform fee) if platformFee isn't set
                    const guideCut = data.guideEarning || (amount * 0.9);

                    total += guideCut;

                    if (data.paymentStatus === "pending_payout" || data.paymentStatus === "unpaid") {
                        pending += guideCut;
                    }

                    if (data.createdAt?.toDate) {
                        const date = data.createdAt.toDate();
                        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                            monthly += guideCut;
                        }
                    }
                });

                setStats({ totalEarnings: total, monthlyEarnings: monthly, pendingPayouts: pending });
                setCompletedBookings(pastBookings.sort((a,b) => (b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0) - (a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0)));

            } catch (error) {
                console.error("Error fetching earnings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "guide") fetchEarnings();
    }, [user, dbUser]);

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    // Mock Chart Data
    const chartData = [
        { label: "Jan", value: 3000 },
        { label: "Feb", value: 5500 },
        { label: "Mar", value: stats.monthlyEarnings || 8000 }, // Current month
        { label: "Apr", value: 0 },
        { label: "May", value: 0 },
        { label: "Jun", value: 0 },
    ];
    const maxVal = Math.max(...chartData.map(d => d.value), 10000);

    return (
        <div className="max-w-5xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Earnings</h1>
                    <p className="text-slate-500">Track your revenue and manage payouts.</p>
                </div>
                <Button variant="outline" className="rounded-xl flex items-center gap-2 font-bold w-fit">
                    <ArrowDownToLine className="h-4 w-4" />
                    Download CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm bg-gradient-to-br from-teal-600 to-teal-800 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                            <Wallet2 className="h-6 w-6" />
                        </div>
                        <span className="font-bold opacity-90 tracking-wide uppercase text-sm">Total Expected</span>
                    </div>
                    <p className="text-4xl font-black">৳{stats.totalEarnings.toLocaleString()}</p>
                </Card>
                <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-4 text-slate-500">
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-slate-600" />
                        </div>
                        <span className="font-bold tracking-wide uppercase text-sm">This Month</span>
                    </div>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">৳{stats.monthlyEarnings.toLocaleString()}</p>
                </Card>
                <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4 text-slate-500">
                            <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center">
                                <History className="h-6 w-6 text-amber-500" />
                            </div>
                            <span className="font-bold tracking-wide uppercase text-sm">Pending Payout</span>
                        </div>
                        {stats.pendingPayouts > 0 && (
                            <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs h-7">Withdraw</Button>
                        )}
                    </div>
                    <p className="text-4xl font-black text-amber-500">৳{stats.pendingPayouts.toLocaleString()}</p>
                </Card>
            </div>

            <Card className="p-6 md:p-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-lg mb-8">Revenue Overview</h3>
                <div className="h-64 flex items-end gap-2 md:gap-8 pt-4">
                    {chartData.map((data, i) => {
                        const heightPercentage = data.value > 0 ? `${(data.value / maxVal) * 100}%` : '5px';
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                <div className="w-full flex justify-center h-full relative group">
                                    <div 
                                        className="w-full max-w-[48px] bg-teal-100 dark:bg-teal-900/40 rounded-t-xl group-hover:bg-teal-500 dark:group-hover:bg-teal-600 transition-colors absolute bottom-0"
                                        style={{ height: heightPercentage }}
                                    ></div>
                                    <span className="absolute -top-8 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                        ৳{data.value}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{data.label}</span>
                            </div>
                        )
                    })}
                </div>
            </Card>

        </div>
    );
}
