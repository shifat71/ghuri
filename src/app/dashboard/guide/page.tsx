"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, getDoc, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    CheckCircle2, ShieldAlert, Users, TrendingUp, User, Compass,
    Wallet, Star, Calendar, Clock, ChevronRight, MapPin, CreditCard,
    BadgeDollarSign, BarChart3, CheckCircle, XCircle, Loader2, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideFeed } from "@/components/guide/GuideFeed";
import Link from "next/link";
import { getVerificationBadge } from "@/lib/verification";

export default function GuideDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [guideProfile, setGuideProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

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
                const profileDoc = await getDoc(doc(db, "guides", user.uid));
                if (profileDoc.exists()) setGuideProfile(profileDoc.data());

                const q = query(
                    collection(db, "orders"),
                    where("guideId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching guide data:", error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        if (user && dbUser?.role === "guide") fetchData();
    }, [user, dbUser]);

    const handleOrderAction = async (orderId: string, newStatus: string) => {
        setActionLoading(orderId);
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating order:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading || dbUser?.role !== "guide" || isLoadingPage) return null;

    const isVerified = guideProfile?.nogoriStatus === "verified" || guideProfile?.nogoriStatus === "pro";
    const verificationBadge = getVerificationBadge(guideProfile?.nogoriStatus || "pending");

    // Earnings calculations
    const completedOrders = orders.filter(o => o.status === "completed");
    const confirmedOrders = orders.filter(o => o.status === "confirmed");
    const pendingOrders = orders.filter(o => o.status === "pending");
    const cancelledOrders = orders.filter(o => o.status === "cancelled");

    const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0);
    const pendingEarnings = confirmedOrders.reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0);
    const platformFee = Math.round(totalEarnings * 0.10); // 10% platform fee
    const paidEarnings = totalEarnings - platformFee;

    const avgRating = guideProfile?.rating || 0;
    const totalReviews = guideProfile?.reviews || 0;

    const formatDate = (ts: any) => {
        if (!ts) return "TBD";
        try {
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
        } catch { return "TBD"; }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "pending": return "bg-amber-100 text-amber-800";
            case "confirmed": return "bg-blue-100 text-blue-800";
            case "completed": return "bg-emerald-100 text-emerald-800";
            case "cancelled": return "bg-red-100 text-red-800";
            default: return "bg-slate-100 text-slate-800";
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                        Guide Dashboard
                    </h1>
                    <p className="text-slate-500">Welcome back, {guideProfile?.name?.split(" ")[0] || "Guide"}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/guides/${user?.uid}`}>
                        <Button variant="outline" className="rounded-xl flex items-center gap-2">
                            <Compass className="h-4 w-4" />
                            <span className="hidden sm:inline">Public Profile</span>
                        </Button>
                    </Link>
                    <Link href={`/guides/${user?.uid}`}>
                        <Button className="rounded-xl flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white">
                            <User className="h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Verification Warning */}
            {!isVerified && (
                <div className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-900 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-amber-900 dark:text-amber-400">
                            {guideProfile?.nogoriStatus === "id_submitted"
                                ? "Your verification is under review"
                                : "Complete your Nogori Verification"}
                        </h3>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                            {guideProfile?.nogoriStatus === "id_submitted"
                                ? "Our team is reviewing your documents. You'll be notified once approved."
                                : "Upload your student ID or contact info@ghuri.com to get verified."}
                        </p>
                    </div>
                </div>
            )}

            {/* Earnings & Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <Wallet className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Total Earned</p>
                            <p className="text-xl font-bold text-emerald-600">৳{totalEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                            <BadgeDollarSign className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Paid Out</p>
                            <p className="text-xl font-bold text-teal-600">৳{paidEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Pending</p>
                            <p className="text-xl font-bold text-amber-600">৳{pendingEarnings.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Platform Fee</p>
                            <p className="text-xl font-bold text-purple-600">৳{platformFee.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                <Card className="p-3 rounded-xl border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">Total Orders</p>
                </Card>
                <Card className="p-3 rounded-xl border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedOrders.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">Completed</p>
                </Card>
                <Card className="p-3 rounded-xl border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingOrders.length}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">Pending</p>
                </Card>
                <Card className="p-3 rounded-xl border-slate-200 dark:border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium mt-0.5">{totalReviews} Reviews</p>
                </Card>
                <Card className={`p-3 rounded-xl text-center ${verificationBadge.bgColor}`}>
                    <div className="flex items-center justify-center gap-1">
                        <CheckCircle2 className={`h-4 w-4 ${verificationBadge.color}`} />
                    </div>
                    <p className={`text-[10px] uppercase tracking-wider font-bold mt-1 ${verificationBadge.color}`}>{verificationBadge.label}</p>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="orders" className="w-full">
                <TabsList className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 p-1 w-full grid grid-cols-3">
                    <TabsTrigger value="orders" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        Orders ({orders.length})
                    </TabsTrigger>
                    <TabsTrigger value="feed" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        Feed
                    </TabsTrigger>
                    <TabsTrigger value="earnings" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        Earnings
                    </TabsTrigger>
                </TabsList>

                {/* Orders Tab */}
                <TabsContent value="orders" className="mt-0">
                    {orders.length === 0 ? (
                        <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200">
                            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No bookings yet</h3>
                            <p className="text-slate-500 text-sm">Make sure your profile and services look great to attract travelers!</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order) => (
                                <Card key={order.id} className="rounded-2xl border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white">
                                                    {order.title || `Booking #${order.id.substring(0, 6)}`}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    by {order.travelerDetails?.fullName || order.customerName || "Traveler"}
                                                </p>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-4 gap-3 py-3 border-y border-slate-100 dark:border-slate-800">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Date</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                                    {formatDate(order.dates?.from || order.startDate)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Group</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                                    {order.travelerDetails?.groupSize || order.groupSize || 1}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Amount</p>
                                                <p className="text-sm font-bold text-teal-600 mt-0.5">
                                                    ৳{(order.totalAmount || order.totalPrice || 0).toLocaleString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">WhatsApp</p>
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                                    {order.travelerDetails?.whatsappNumber || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        {order.travelerDetails?.specialRequests && (
                                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs text-slate-600 dark:text-slate-400">
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">Note: </span>
                                                {order.travelerDetails.specialRequests}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-2 mt-3">
                                            {order.status === "pending" && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOrderAction(order.id, "cancelled")}
                                                        disabled={actionLoading === order.id}
                                                        className="rounded-lg text-xs h-8 border-red-200 text-red-600 hover:bg-red-50"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                                                        Decline
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOrderAction(order.id, "confirmed")}
                                                        disabled={actionLoading === order.id}
                                                        className="rounded-lg text-xs h-8 bg-emerald-600 hover:bg-emerald-700"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                                        Accept
                                                    </Button>
                                                </>
                                            )}
                                            {order.status === "confirmed" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleOrderAction(order.id, "completed")}
                                                    disabled={actionLoading === order.id}
                                                    className="rounded-lg text-xs h-8 bg-teal-600 hover:bg-teal-700"
                                                >
                                                    {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                                    Mark Completed
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Feed Tab */}
                <TabsContent value="feed" className="mt-0">
                    <GuideFeed
                        guideId={user?.uid || ""}
                        guideAvatar={guideProfile?.avatarUrl || dbUser?.photoURL || user?.photoURL || ""}
                        guideName={guideProfile?.name || dbUser?.displayName || user?.displayName || "Guide"}
                    />
                </TabsContent>

                {/* Earnings Tab */}
                <TabsContent value="earnings" className="mt-0">
                    <div className="space-y-6">
                        {/* Earnings Summary Card */}
                        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Earnings Summary</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-600 dark:text-slate-400">Gross Earnings (Completed)</span>
                                    <span className="font-bold text-slate-900 dark:text-white">৳{totalEarnings.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-600 dark:text-slate-400">Platform Fee (10%)</span>
                                    <span className="font-bold text-red-500">-৳{platformFee.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-600 dark:text-slate-400">Net Payout</span>
                                    <span className="font-bold text-emerald-600 text-lg">৳{paidEarnings.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between py-3">
                                    <span className="text-slate-600 dark:text-slate-400">Upcoming (Confirmed, not completed)</span>
                                    <span className="font-bold text-amber-600">৳{pendingEarnings.toLocaleString()}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Transaction History */}
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Transaction History</h3>
                            {completedOrders.length === 0 ? (
                                <Card className="p-8 text-center rounded-2xl border-dashed border-slate-200">
                                    <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No completed transactions yet.</p>
                                </Card>
                            ) : (
                                <div className="space-y-2">
                                    {completedOrders.map((order) => (
                                        <Card key={order.id} className="p-4 rounded-xl border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                        {order.title || `Booking #${order.id.substring(0, 6)}`}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-emerald-600">
                                                +৳{Math.round((order.totalAmount || order.totalPrice || 0) * 0.9).toLocaleString()}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
