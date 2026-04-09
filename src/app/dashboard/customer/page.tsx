"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import {
    Compass, Calendar, User, ShieldCheck, Upload, CheckCircle, Clock, XCircle,
    MapPin, Star, CreditCard, ChevronRight, MessageSquare, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getNidBadge, type NidStatus } from "@/lib/verification";

// ── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_PILL: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700 border border-amber-200",
    confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
    completed: "bg-[#067c18]/10 text-[#067c18] border border-[#067c18]/20",
    cancelled: "bg-red-100 text-red-600 border border-red-200",
};

const STATUS_LEFT: Record<string, string> = {
    pending:   "bg-amber-400",
    confirmed: "bg-blue-500",
    completed: "bg-[#067c18]",
    cancelled: "bg-red-400",
};

function formatDate(ts: unknown): string {
    if (!ts) return "TBD";
    try {
        const t = ts as { toDate?: () => Date };
        const d = t.toDate ? t.toDate() : new Date(ts as string);
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch { return "TBD"; }
}

function StatCard({ label, value, icon: Icon, color }: {
    label: string; value: string | number; icon: React.ElementType; color: string;
}) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.06)] flex items-center gap-4">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{value}</p>
            </div>
        </div>
    );
}

function EmptyState({ message }: { message?: string }) {
    return (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Compass className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-700 mb-1">{message ?? "No trips yet"}</h3>
            <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">Browse our verified local guides to start your next adventure.</p>
            <Link href="/guides">
                <Button className="rounded-full bg-[#067c18] hover:bg-[#055f12] px-6">Explore Guides</Button>
            </Link>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function CustomerDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
    const [guidesMap, setGuidesMap] = useState<Record<string, Record<string, unknown>>>({});
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

    const [nidFile, setNidFile] = useState<File | null>(null);
    const [nidPreview, setNidPreview] = useState<string | null>(null);
    const [isUploadingNid, setIsUploadingNid] = useState(false);
    const [nidUploadSuccess, setNidUploadSuccess] = useState(false);
    const nidInputRef = useRef<HTMLInputElement>(null);

    const nidStatus = ((dbUser?.nidStatus ?? "not_submitted") as NidStatus);

    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "customer") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    useEffect(() => {
        if (!user || dbUser?.role !== "customer") return;
        const fetchOrders = async () => {
            try {
                const q = query(collection(db, "orders"), where("customerId", "==", user.uid), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const ordersData = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Record<string, unknown>[];
                setOrders(ordersData);

                const guideIds = [...new Set(ordersData.map(o => o.guideId as string).filter(Boolean))];
                const guidesData: Record<string, Record<string, unknown>> = {};
                for (const gid of guideIds) {
                    try {
                        const guideDoc = await getDoc(doc(db, "guides", gid));
                        if (guideDoc.exists()) guidesData[gid] = guideDoc.data() as Record<string, unknown>;
                    } catch { /* ignore */ }
                }
                setGuidesMap(guidesData);
            } catch (err) { console.error(err); }
            finally { setIsLoadingOrders(false); }
        };
        fetchOrders();
    }, [user, dbUser]);

    const handleNidFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { alert("File size must be under 5 MB"); return; }
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
        } catch (err) { console.error(err); }
        finally { setIsUploadingNid(false); }
    };

    if (loading || dbUser?.role !== "customer") return null;

    const pendingOrders   = orders.filter(o => o.status === "pending");
    const confirmedOrders = orders.filter(o => o.status === "confirmed");
    const completedOrders = orders.filter(o => o.status === "completed");
    const cancelledOrders = orders.filter(o => o.status === "cancelled");
    const totalSpent = orders
        .filter(o => o.status === "completed" || o.status === "confirmed")
        .reduce((s, o) => s + ((o.totalAmount as number) || (o.totalPrice as number) || 0), 0);

    const displayName = dbUser?.displayName?.split(" ")?.[0] ?? "Traveler";

    const TABS: { id: typeof activeTab; label: string; count: number }[] = [
        { id: "all",       label: "All Trips",   count: orders.length },
        { id: "upcoming",  label: "Upcoming",    count: pendingOrders.length + confirmedOrders.length },
        { id: "completed", label: "Completed",   count: completedOrders.length },
        { id: "cancelled", label: "Cancelled",   count: cancelledOrders.length },
    ];

    const tabOrders: Record<typeof activeTab, Record<string, unknown>[]> = {
        all:       orders,
        upcoming:  [...pendingOrders, ...confirmedOrders],
        completed: completedOrders,
        cancelled: cancelledOrders,
    };

    const OrderCard = ({ order }: { order: Record<string, unknown> }) => {
        const guide = guidesMap[order.guideId as string];
        const td = (order.travelerDetails ?? {}) as Record<string, unknown>;

        return (
            <div className="relative flex gap-0 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/50 hover:bg-white transition-colors hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                <div className={`w-1 shrink-0 ${STATUS_LEFT[(order.status as string)] ?? "bg-gray-300"}`} />
                <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                            {guide?.avatarUrl ? (
                                <img src={guide.avatarUrl as string} alt={guide.name as string} className="h-10 w-10 rounded-xl object-cover border border-gray-100" />
                            ) : (
                                <div className="h-10 w-10 rounded-xl bg-[#067c18]/10 flex items-center justify-center text-[#067c18] font-bold text-sm">
                                    {((guide?.name as string) ?? "G").charAt(0)}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">
                                    {(order.title as string) ?? `Trip with ${(guide?.name as string) ?? "Guide"}`}
                                </h3>
                                {(guide?.locations as string[])?.[0] && (
                                    <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                        <MapPin className="h-3 w-3" />
                                        {(guide.locations as string[])[0]}
                                    </span>
                                )}
                            </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${STATUS_PILL[(order.status as string)] ?? "bg-gray-100 text-gray-600"}`}>
                            {order.status as string}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 py-3 border-y border-gray-100">
                        {[
                            { label: "Date",  value: formatDate((order.dates as Record<string, unknown>)?.from ?? order.startDate) },
                            { label: "Group", value: `${(td.groupSize as number) ?? (order.groupSize as number) ?? 1} person(s)` },
                            { label: "Total", value: `৳${((order.totalAmount as number) || (order.totalPrice as number) || 0).toLocaleString()}` },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
                                <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                            {order.status === "confirmed" && (
                                <Button size="sm" className="rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white text-xs h-8 gap-1 px-3">
                                    <MessageSquare className="h-3 w-3" /> WhatsApp
                                </Button>
                            )}
                        </div>
                        <Link href={`/guides/${order.guideId as string}`}>
                            <Button variant="ghost" size="sm" className="rounded-full text-xs text-gray-400 hover:text-[#067c18] h-8 gap-1 px-3">
                                View Guide <ChevronRight className="h-3 w-3" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.06)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">My Dashboard</p>
                    <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                        Welcome back, {displayName} 👋
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Your travel activity at a glance.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link href="/dashboard/customer/profile">
                        <Button variant="outline" className="rounded-full h-9 px-4 text-sm border-gray-200 text-gray-600 hover:text-[#067c18] hover:border-[#067c18]/30 gap-1.5">
                            <User className="h-4 w-4" /> Profile
                        </Button>
                    </Link>
                    <Link href="/guides">
                        <Button className="rounded-full h-9 px-4 text-sm bg-[#067c18] hover:bg-[#055f12] gap-1.5">
                            <Compass className="h-4 w-4" /> Find Guide
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ── NID Verification Banner ── */}
            {nidStatus === "verified" ? (
                <div className="p-4 bg-[#067c18]/8 border border-[#067c18]/20 rounded-2xl flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-[#067c18] shrink-0" />
                    <p className="text-sm font-medium text-[#067c18]">NID verified — you can book any guide.</p>
                </div>
            ) : nidStatus === "submitted" || nidUploadSuccess ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3">
                    <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                    <p className="text-sm font-medium text-blue-700">NID under review — you can browse while we verify.</p>
                </div>
            ) : nidStatus === "rejected" ? (
                <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800">NID rejected — please re-upload a clear photo.</p>
                            <input ref={nidInputRef} type="file" accept="image/*" onChange={handleNidFileSelect} className="hidden" />
                            {nidPreview ? (
                                <div className="mt-3 space-y-2">
                                    <img src={nidPreview} alt="NID preview" className="w-full max-h-40 object-contain rounded-xl border border-gray-200 bg-white" />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setNidFile(null); setNidPreview(null); }} className="rounded-full">Remove</Button>
                                        <Button size="sm" onClick={handleNidUpload} disabled={isUploadingNid} className="rounded-full bg-[#067c18]">
                                            {isUploadingNid ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Uploading…</> : "Re-submit NID"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button variant="outline" size="sm" onClick={() => nidInputRef.current?.click()} className="mt-3 rounded-full gap-2">
                                    <Upload className="h-4 w-4" /> Upload NID Again
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-gray-900">Verify your NID to book guides</h3>
                            <p className="text-xs text-gray-500 mt-0.5">One-time verification keeps the community safe.</p>
                            <input ref={nidInputRef} type="file" accept="image/*" onChange={handleNidFileSelect} className="hidden" />
                            {nidPreview ? (
                                <div className="mt-3 space-y-2">
                                    <img src={nidPreview} alt="NID preview" className="w-full max-h-40 object-contain rounded-xl border border-gray-200 bg-white" />
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setNidFile(null); setNidPreview(null); }} className="rounded-full">Remove</Button>
                                        <Button size="sm" onClick={handleNidUpload} disabled={isUploadingNid} className="rounded-full bg-[#067c18]">
                                            {isUploadingNid ? <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Uploading…</> : "Submit NID"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => nidInputRef.current?.click()}
                                    className="mt-3 w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-amber-200 rounded-xl hover:border-[#067c18]/40 hover:bg-[#067c18]/5 transition-all cursor-pointer group"
                                >
                                    <Upload className="h-4 w-4 text-gray-400 group-hover:text-[#067c18]" />
                                    <span className="text-sm font-medium text-gray-600">Upload NID card</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Trips"   value={orders.length}                               icon={Calendar}    color="bg-blue-100 text-blue-600" />
                <StatCard label="Upcoming"      value={pendingOrders.length + confirmedOrders.length} icon={Clock}     color="bg-amber-100 text-amber-600" />
                <StatCard label="Completed"     value={completedOrders.length}                      icon={CheckCircle} color="bg-[#067c18]/10 text-[#067c18]" />
                <StatCard label="Total Spent"   value={`৳${totalSpent.toLocaleString()}`}           icon={CreditCard}  color="bg-[#8e63f0]/10 text-[#8e63f0]" />
            </div>

            {/* ── Trips Tabs ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="flex border-b border-gray-100 px-6 pt-1 overflow-x-auto no-scrollbar">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`mr-6 py-3.5 text-sm font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
                                activeTab === tab.id
                                    ? "border-[#067c18] text-[#067c18]"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {tab.label}
                            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-[#067c18]/10 text-[#067c18]" : "bg-gray-100 text-gray-400"}`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {isLoadingOrders ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)}
                        </div>
                    ) : tabOrders[activeTab].length === 0 ? (
                        <EmptyState message={activeTab !== "all" ? `No ${activeTab} trips.` : undefined} />
                    ) : (
                        <div className="space-y-3">
                            {tabOrders[activeTab].map(o => <OrderCard key={o.id as string} order={o} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
