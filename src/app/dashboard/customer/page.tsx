"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, CheckCircle2, Compass, Heart, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURED_DESTINATIONS = [
    { name: "Sylhet", label: "Tea Gardens & Hills", seed: "sylhet", color: "from-emerald-600 to-emerald-900" },
    { name: "Cox's Bazar", label: "World's Longest Beach", seed: "coxsbazar", color: "from-blue-600 to-blue-900" },
    { name: "Sundarbans", label: "Royal Bengal Tiger", seed: "sundarbans", color: "from-teal-700 to-teal-900" },
    { name: "Bandarban", label: "Hill Tracts & Waterfalls", seed: "bandarban", color: "from-indigo-600 to-indigo-900" },
];

export default function CustomerOverviewPage() {
    const { user, dbUser, loading } = useAuth();
    const { orders, loading: ordersLoading } = useOrders('customer');

    if (loading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    const upcoming = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');
    const completed = orders.filter(o => o.status === 'completed');

    return (
        <div className="space-y-8 max-w-5xl">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-teal-950 p-8 md:p-10 text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10">
                    <p className="text-teal-400 font-bold uppercase tracking-widest text-sm mb-2">Welcome back</p>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">
                        {user.displayName?.split(" ")[0] || "Explorer"} 👋
                    </h1>
                    <p className="text-slate-300 mb-6 max-w-lg">
                        Ready for your next adventure? Browse verified local guides across Bangladesh or manage your existing trips.
                    </p>
                    <Link href="/dashboard/customer/explore">
                        <Button className="bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl px-6 flex items-center gap-2">
                            <Compass className="h-5 w-5" /> Explore Guides <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
                    { label: "Completed", value: completed.length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
                    { label: "Total Trips", value: orders.length, icon: MapPin, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950/40" },
                    { label: "Destinations", value: [...new Set(orders.map(o => o.destination).filter(Boolean))].length, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
                ].map((stat) => (
                    <Card key={stat.label} className="p-5 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
                        <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-black">{ordersLoading ? '—' : stat.value}</p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Trips */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Trips</h2>
                    <Link href="/dashboard/customer/trips">
                        <Button variant="ghost" size="sm" className="text-teal-600 font-bold">View All <ArrowRight className="h-4 w-4 ml-1" /></Button>
                    </Link>
                </div>
                {ordersLoading ? (
                    <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
                ) : upcoming.length === 0 ? (
                    <Card className="p-10 text-center rounded-3xl border-dashed border-slate-200">
                        <Compass className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">No upcoming trips</p>
                        <p className="text-sm text-slate-500 mb-4">Start by exploring our verified guides across Bangladesh.</p>
                        <Link href="/dashboard/customer/explore">
                            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl">Find a Guide</Button>
                        </Link>
                    </Card>
                ) : upcoming.slice(0, 3).map(order => (
                    <Card key={order.id} className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 mb-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-teal-100 flex items-center justify-center shrink-0">
                                <MapPin className="h-6 w-6 text-teal-700" />
                            </div>
                            <div>
                                <p className="font-bold">{order.destination || `Trip with ${order.guideName}`}</p>
                                <p className="text-sm text-slate-500">
                                    {order.startDate?.toDate ? order.startDate.toDate().toLocaleDateString() : 'TBD'} · ৳{order.totalPrice}
                                </p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                        </span>
                    </Card>
                ))}
            </div>

            {/* Featured Destinations */}
            <div>
                <h2 className="text-xl font-bold mb-4">Featured Destinations</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {FEATURED_DESTINATIONS.map(dest => (
                        <Link href={`/dashboard/customer/explore?location=${encodeURIComponent(dest.name)}`} key={dest.name}>
                            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-b ${dest.color} p-4 h-32 cursor-pointer group hover:scale-105 transition-transform duration-200`}>
                                <img src={`https://picsum.photos/seed/${dest.seed}/400/300`} alt={dest.name} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-3 left-3 text-white">
                                    <p className="font-black text-sm">{dest.name}</p>
                                    <p className="text-xs opacity-80">{dest.label}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
