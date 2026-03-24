"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Compass, Calendar, User, ShieldCheck, Upload, CheckCircle, Clock, XCircle,
    MapPin, Star, TrendingUp, CreditCard, ChevronRight, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, CheckCircle2, Compass, Heart, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getNidBadge, type NidStatus } from "@/lib/verification";

export default function CustomerDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [guidesMap, setGuidesMap] = useState<Record<string, any>>({});
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // NID Upload State
    const [nidFile, setNidFile] = useState<File | null>(null);
    const [nidPreview, setNidPreview] = useState<string | null>(null);
    const [isUploadingNid, setIsUploadingNid] = useState(false);
    const [nidUploadSuccess, setNidUploadSuccess] = useState(false);
    const nidInputRef = useRef<HTMLInputElement>(null);

    const nidStatus = (dbUser?.nidStatus || "not_submitted") as NidStatus;

    // Auth Guard
    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "customer") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    // Fetch Orders + Guide details
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
                const ordersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setOrders(ordersData);

                // Fetch guide details for each unique guideId
                const guideIds = [...new Set(ordersData.map((o: any) => o.guideId).filter(Boolean))];
                const guidesData: Record<string, any> = {};
                for (const gid of guideIds) {
                    try {
                        const guideDoc = await getDoc(doc(db, "guides", gid));
                        if (guideDoc.exists()) {
                            guidesData[gid] = guideDoc.data();
                        }
                    } catch { /* ignore */ }
                }
                setGuidesMap(guidesData);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoadingOrders(false);
            }
        };

        if (user && dbUser?.role === "customer") fetchOrders();
    }, [user, dbUser]);

    const handleNidFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert("File size must be under 5MB"); return; }
        setNidFile(file);
        setNidPreview(URL.createObjectURL(file));
    };

    const handleNidUpload = async () => {
        if (!user || !nidFile) return;
        setIsUploadingNid(true);
        try {
            const storageRef = ref(storage, `verification/${user.uid}/nid_${Date.now()}`);
            await uploadBytes(storageRef, nidFile);
            const nidUrl = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "users", user.uid), { nidUrl, nidStatus: "submitted", updatedAt: serverTimestamp() });
            setNidUploadSuccess(true);
            setNidFile(null);
            setNidPreview(null);
        } catch (error) {
            console.error("Error uploading NID:", error);
            alert("Failed to upload NID. Please try again.");
        } finally {
            setIsUploadingNid(false);
        }
    };

    if (loading || dbUser?.role !== "customer") return null;

    // Derived stats
    const pendingOrders = orders.filter(o => o.status === "pending");
    const confirmedOrders = orders.filter(o => o.status === "confirmed");
    const completedOrders = orders.filter(o => o.status === "completed");
    const cancelledOrders = orders.filter(o => o.status === "cancelled");
    const totalSpent = orders
        .filter(o => o.status === "completed" || o.status === "confirmed")
        .reduce((sum, o) => sum + (o.totalAmount || o.totalPrice || 0), 0);

    const formatDate = (ts: any) => {
        if (!ts) return "TBD";
        try {
            const d = ts.toDate ? ts.toDate() : new Date(ts);
            return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
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

    const OrderCard = ({ order }: { order: any }) => {
        const guide = guidesMap[order.guideId];
        return (
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            {guide?.avatarUrl ? (
                                <img src={guide.avatarUrl} alt={guide.name} className="h-10 w-10 rounded-xl object-cover" />
                            ) : (
                                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
                                    {guide?.name?.charAt(0) || "G"}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">
                                    {order.title || `Trip with ${guide?.name || "Guide"}`}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                    {guide?.locations?.[0] && (
                                        <span className="flex items-center gap-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {guide.locations[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusStyle(order.status)}`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Dates</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                {formatDate(order.dates?.from || order.startDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Group</p>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                                {order.travelerDetails?.groupSize || order.groupSize || 1} person{(order.travelerDetails?.groupSize || order.groupSize || 1) > 1 ? "s" : ""}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Total</p>
                            <p className="text-sm font-bold text-teal-600 mt-0.5">
                                ৳{(order.totalAmount || order.totalPrice || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                            {order.status === "confirmed" && (
                                <Button size="sm" className="rounded-lg bg-[#25D366] hover:bg-[#1DA851] text-white text-xs h-8 gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    WhatsApp
                                </Button>
                            )}
                        </div>
                        <Link href={`/guides/${order.guideId}`}>
                            <Button variant="ghost" size="sm" className="rounded-lg text-xs text-slate-500 h-8 gap-1">
                                View Guide <ChevronRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                        Welcome back, {dbUser?.displayName?.split(" ")[0] || "Traveler"}
                    </h1>
                    <p className="text-slate-500">Your travel dashboard at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/customer/profile">
                        <Button variant="outline" className="rounded-xl flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </Button>
                    </Link>
                    <Link href="/guides">
                        <Button className="rounded-xl flex items-center gap-2 bg-teal-600 hover:bg-teal-700">
                            <Compass className="h-4 w-4" />
                            Find Guide
                        </Button>
                    </Link>
                </div>
            </div>

            {/* NID Verification Banner */}
            {nidStatus === "verified" ? (
                <div className="mb-6 p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">NID verified — you can book any guide.</p>
                </div>
            ) : nidStatus === "submitted" || nidUploadSuccess ? (
                <div className="mb-6 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">NID under review — you can browse while we verify.</p>
                </div>
            ) : nidStatus === "rejected" ? (
                <Card className="mb-6 p-5 rounded-2xl border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10">
                    <div className="flex items-start gap-3 mb-3">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300">NID rejected — please re-upload a clear photo.</p>
                        </div>
                    </div>
                    <input ref={nidInputRef} type="file" accept="image/*" onChange={handleNidFileSelect} className="hidden" />
                    {nidPreview ? (
                        <div className="space-y-3">
                            <img src={nidPreview} alt="NID preview" className="w-full max-h-40 object-contain rounded-xl border border-slate-200 bg-white" />
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setNidFile(null); setNidPreview(null); }} className="rounded-lg">Remove</Button>
                                <Button size="sm" onClick={handleNidUpload} disabled={isUploadingNid} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                                    {isUploadingNid ? "Uploading..." : "Re-submit NID"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => nidInputRef.current?.click()} className="rounded-xl">
                            <Upload className="h-4 w-4 mr-2" /> Upload NID Again
                        </Button>
                    )}
                </Card>
            ) : (
                <Card className="mb-6 p-5 rounded-2xl border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
                    <div className="flex items-start gap-3 mb-3">
                        <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verify your NID to book guides</h3>
                            <p className="text-xs text-slate-500 mt-0.5">One-time verification keeps the community safe.</p>
                        </div>
                    </div>
                    <input ref={nidInputRef} type="file" accept="image/*" onChange={handleNidFileSelect} className="hidden" />
                    {nidPreview ? (
                        <div className="space-y-3">
                            <img src={nidPreview} alt="NID preview" className="w-full max-h-40 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800" />
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setNidFile(null); setNidPreview(null); }} className="rounded-lg">Remove</Button>
                                <Button size="sm" onClick={handleNidUpload} disabled={isUploadingNid} className="rounded-lg bg-teal-600 hover:bg-teal-700">
                                    {isUploadingNid ? "Uploading..." : "Submit NID"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => nidInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-teal-400 transition-colors cursor-pointer">
                            <Upload className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload NID card</span>
                        </button>
                    )}
                </Card>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Trips</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Upcoming</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{pendingOrders.length + confirmedOrders.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Completed</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{completedOrders.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 font-medium">Total Spent</p>
                            <p className="text-xl font-bold text-teal-600">৳{totalSpent.toLocaleString()}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Trips Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 p-1">
                    <TabsTrigger value="all" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        All ({orders.length})
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        Upcoming ({pendingOrders.length + confirmedOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        Completed ({completedOrders.length})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="rounded-lg text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                        Cancelled ({cancelledOrders.length})
                    </TabsTrigger>
                </TabsList>

                {isLoadingOrders ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="w-full h-36 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)}
                    </div>
                ) : (
                    <>
                        <TabsContent value="all" className="mt-0 space-y-4">
                            {orders.length > 0 ? orders.map(o => <OrderCard key={o.id} order={o} />) : <EmptyState />}
                        </TabsContent>
                        <TabsContent value="upcoming" className="mt-0 space-y-4">
                            {(pendingOrders.length + confirmedOrders.length) > 0
                                ? [...pendingOrders, ...confirmedOrders].map(o => <OrderCard key={o.id} order={o} />)
                                : <EmptyState message="No upcoming trips." />}
                        </TabsContent>
                        <TabsContent value="completed" className="mt-0 space-y-4">
                            {completedOrders.length > 0
                                ? completedOrders.map(o => <OrderCard key={o.id} order={o} />)
                                : <EmptyState message="No completed trips yet." />}
                        </TabsContent>
                        <TabsContent value="cancelled" className="mt-0 space-y-4">
                            {cancelledOrders.length > 0
                                ? cancelledOrders.map(o => <OrderCard key={o.id} order={o} />)
                                : <EmptyState message="No cancelled trips." />}
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}

function EmptyState({ message }: { message?: string }) {
    return (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <Compass className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{message || "No trips yet"}</h3>
            <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">Browse our verified local guides to start your next adventure.</p>
            <Link href="/guides">
                <Button className="rounded-xl">Explore Guides</Button>
            </Link>
        </div>
    );
}
