"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, getDoc, orderBy, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import {
    CheckCircle2, ShieldAlert, Wallet, Star, Calendar, Clock,
    Compass, User, BadgeDollarSign, BarChart3, CheckCircle, XCircle,
    Loader2, Upload, GraduationCap, ArrowRight, TrendingUp, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideFeed } from "@/components/guide/GuideFeed";
import Link from "next/link";
import { getVerificationBadge } from "@/lib/verification";

// ── Status helpers ──────────────────────────────────────────────────────────

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
        return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } catch { return "TBD"; }
}

// ── Student ID Upload UI ────────────────────────────────────────────────────

function VerificationUploadUI({
    studentIdFile, studentIdPreview, isUploading, uploadError,
    onSelect, onUpload, onRemove, inputRef,
}: {
    studentIdFile: File | null;
    studentIdPreview: string | null;
    isUploading: boolean;
    uploadError: string | null;
    onSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUpload: () => void;
    onRemove: () => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
}) {
    return (
        <div className="flex flex-col gap-3 mt-3">
            <input ref={inputRef} type="file" accept="image/*" onChange={onSelect} className="hidden" />
            {studentIdPreview ? (
                <div className="relative">
                    <img src={studentIdPreview} alt="Student ID preview" className="w-full max-h-44 object-contain rounded-2xl border border-gray-200 bg-white" />
                    <button onClick={onRemove} className="absolute top-2 right-2 text-xs bg-white px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:text-red-600 transition-colors shadow-sm">Remove</button>
                </div>
            ) : (
                <button
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-2xl hover:border-[#067c18]/40 hover:bg-[#067c18]/5 transition-all cursor-pointer group"
                >
                    <div className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 group-hover:bg-[#067c18]/10 transition-colors">
                        <Upload className="h-4 w-4 text-gray-400 group-hover:text-[#067c18]" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-gray-700">Upload Student ID card</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPG or PNG · max 5 MB</p>
                    </div>
                </button>
            )}
            {uploadError && <p className="text-xs text-red-600 font-medium">{uploadError}</p>}
            {studentIdFile && (
                <Button
                    onClick={onUpload}
                    disabled={isUploading}
                    className="w-full rounded-xl bg-[#067c18] hover:bg-[#055f12] gap-2 h-10"
                >
                    {isUploading
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                        : <><GraduationCap className="h-4 w-4" /> Submit for Verification</>}
                </Button>
            )}
        </div>
    );
}

// ── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
    label: string; value: string; icon: React.ElementType; color: string;
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

// ── Main Component ──────────────────────────────────────────────────────────

export default function GuideDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [guideProfile, setGuideProfile] = useState<Record<string, unknown> | null>(null);
    const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"orders" | "feed" | "earnings">("orders");

    const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
    const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);
    const [isUploadingId, setIsUploadingId] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const studentIdInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "guide") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    useEffect(() => {
        if (!user || dbUser?.role !== "guide") return;
        const fetchData = async () => {
            try {
                const profileDoc = await getDoc(doc(db, "guides", user.uid));
                if (profileDoc.exists()) setGuideProfile(profileDoc.data() as Record<string, unknown>);

                const q = query(collection(db, "orders"), where("guideId", "==", user.uid), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            } catch (err) {
                console.error("Error fetching guide data:", err);
            } finally { setIsLoadingPage(false); }
        };
        fetchData();
    }, [user, dbUser]);

    const handleOrderAction = async (orderId: string, newStatus: string) => {
        setActionLoading(orderId);
        try {
            await updateDoc(doc(db, "orders", orderId), { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) { console.error(err); }
        finally { setActionLoading(null); }
    };

    const handleStudentIdSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setUploadError("File must be under 5 MB"); return; }
        setStudentIdFile(file);
        setStudentIdPreview(URL.createObjectURL(file));
        setUploadError(null);
    };

    const handleStudentIdUpload = async () => {
        if (!user || !studentIdFile) return;
        setIsUploadingId(true);
        setUploadError(null);
        try {
            const storageRef = ref(storage, `verification/${user.uid}/student_id_${Date.now()}`);
            await uploadBytes(storageRef, studentIdFile);
            const studentIdUrl = await getDownloadURL(storageRef);
            await updateDoc(doc(db, "guides", user.uid), { studentIdUrl, nogoriStatus: "id_submitted" });
            setGuideProfile(prev => prev ? { ...prev, nogoriStatus: "id_submitted", studentIdUrl } : prev);
            setUploadSuccess(true);
            setStudentIdFile(null);
            setStudentIdPreview(null);
        } catch (err) {
            console.error(err);
            setUploadError("Upload failed. Please try again.");
        } finally { setIsUploadingId(false); }
    };

    if (loading || dbUser?.role !== "guide" || isLoadingPage) return null;

    const nogoriStatus = (guideProfile?.nogoriStatus ?? "pending") as string;
    const isVerified = nogoriStatus === "verified" || nogoriStatus === "pro";
    const verificationBadge = getVerificationBadge(nogoriStatus);

    const completedOrders = orders.filter(o => o.status === "completed");
    const confirmedOrders = orders.filter(o => o.status === "confirmed");
    const pendingOrders   = orders.filter(o => o.status === "pending");

    const totalEarnings   = completedOrders.reduce((s, o) => s + ((o.totalAmount as number) || (o.totalPrice as number) || 0), 0);
    const pendingEarnings = confirmedOrders.reduce((s, o) => s + ((o.totalAmount as number) || (o.totalPrice as number) || 0), 0);
    const platformFee     = Math.round(totalEarnings * 0.10);
    const paidEarnings    = totalEarnings - platformFee;
    const avgRating       = (guideProfile?.rating as number) || 0;
    const totalReviews    = (guideProfile?.reviews as number) || 0;
    const guideName       = (guideProfile?.name as string) || dbUser?.displayName || "Guide";

    const TABS = [
        { id: "orders" as const,   label: `Orders (${orders.length})` },
        { id: "feed" as const,     label: "Feed" },
        { id: "earnings" as const, label: "Earnings" },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* ── Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.06)] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Guide Dashboard</p>
                    <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                        Welcome back, {guideName.split(" ")[0]} 👋
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${verificationBadge.bgColor} ${verificationBadge.color}`}>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {verificationBadge.label}
                        </span>
                        {avgRating > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                {avgRating.toFixed(1)} · {totalReviews} reviews
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/guides/${user?.uid}`}>
                        <Button variant="outline" className="rounded-full h-9 px-4 text-sm border-gray-200 text-gray-600 hover:text-[#067c18] hover:border-[#067c18]/30 gap-1.5">
                            <Compass className="h-4 w-4" /> Profile
                        </Button>
                    </Link>
                    <Link href="/dashboard/guide/profile">
                        <Button className="rounded-full h-9 px-4 text-sm bg-[#067c18] hover:bg-[#055f12] gap-1.5">
                            <User className="h-4 w-4" /> Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* ── Verification Banner ── */}
            {!isVerified && (
                <div className={`rounded-2xl border p-5 ${
                    nogoriStatus === "id_submitted" ? "bg-blue-50 border-blue-200" :
                    nogoriStatus === "rejected"     ? "bg-red-50 border-red-200" :
                    "bg-amber-50 border-amber-200"
                }`}>
                    <div className="flex items-start gap-3">
                        {nogoriStatus === "id_submitted" ? (
                            <>
                                <Loader2 className="h-5 w-5 text-blue-500 mt-0.5 animate-spin shrink-0" />
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900">Student ID under review</h3>
                                    <p className="text-xs text-blue-700 mt-0.5">Our team is reviewing your document. You will be able to accept bookings once approved.</p>
                                </div>
                            </>
                        ) : nogoriStatus === "rejected" ? (
                            <>
                                <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-red-900">Verification rejected</h3>
                                    <p className="text-xs text-red-700 mt-0.5">Please upload a clearer photo of your Student ID.</p>
                                    <VerificationUploadUI
                                        studentIdFile={studentIdFile} studentIdPreview={studentIdPreview}
                                        isUploading={isUploadingId} uploadError={uploadError}
                                        onSelect={handleStudentIdSelect} onUpload={handleStudentIdUpload}
                                        onRemove={() => { setStudentIdFile(null); setStudentIdPreview(null); }}
                                        inputRef={studentIdInputRef}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-amber-900">Complete Nogori Verification to accept bookings</h3>
                                    <p className="text-xs text-amber-700 mt-0.5">Upload your Student ID card — our admin will review it shortly.</p>
                                    {uploadSuccess ? (
                                        <div className="flex items-center gap-2 mt-3 p-3 bg-[#067c18]/10 border border-[#067c18]/20 rounded-xl">
                                            <CheckCircle className="h-4 w-4 text-[#067c18]" />
                                            <p className="text-sm text-[#067c18] font-medium">Submitted! We will notify you when reviewed.</p>
                                        </div>
                                    ) : (
                                        <VerificationUploadUI
                                            studentIdFile={studentIdFile} studentIdPreview={studentIdPreview}
                                            isUploading={isUploadingId} uploadError={uploadError}
                                            onSelect={handleStudentIdSelect} onUpload={handleStudentIdUpload}
                                            onRemove={() => { setStudentIdFile(null); setStudentIdPreview(null); }}
                                            inputRef={studentIdInputRef}
                                        />
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* ── Earnings Stat Cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Earned" value={`৳${totalEarnings.toLocaleString()}`} icon={Wallet}          color="bg-[#067c18]/10 text-[#067c18]" />
                <StatCard label="Net Payout"   value={`৳${paidEarnings.toLocaleString()}`}   icon={BadgeDollarSign} color="bg-[#8e63f0]/10 text-[#8e63f0]" />
                <StatCard label="Upcoming"     value={`৳${pendingEarnings.toLocaleString()}`} icon={Clock}           color="bg-amber-100 text-amber-600" />
                <StatCard label="Platform Fee" value={`৳${platformFee.toLocaleString()}`}     icon={BarChart3}       color="bg-gray-100 text-gray-500" />
            </div>

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Total Orders", value: orders.length },
                    { label: "Completed", value: completedOrders.length },
                    { label: "Pending", value: pendingOrders.length },
                    { label: "Confirmed", value: confirmedOrders.length },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 text-center shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>{value}</p>
                        <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.06)] overflow-hidden">
                {/* Tab header */}
                <div className="flex border-b border-gray-100 px-6 pt-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`mr-6 py-3.5 text-sm font-semibold border-b-2 transition-all duration-150 ${
                                activeTab === tab.id
                                    ? "border-[#067c18] text-[#067c18]"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    {/* Orders */}
                    {activeTab === "orders" && (
                        orders.length === 0 ? (
                            <div className="text-center py-16">
                                <Calendar className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                                <h3 className="text-base font-bold text-gray-700 mb-1">No bookings yet</h3>
                                <p className="text-sm text-gray-400">Keep your profile updated to attract travelers.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div key={order.id as string} className="relative flex gap-0 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/50 hover:bg-white transition-colors hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]">
                                        {/* Left accent bar */}
                                        <div className={`w-1 shrink-0 ${STATUS_LEFT[(order.status as string)] ?? "bg-gray-300"}`} />
                                        <div className="flex-1 p-5">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-sm">
                                                        {(order.title as string) || `Booking #${(order.id as string).slice(0, 6)}`}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        by {((order.travelerDetails as Record<string, string>)?.fullName) || (order.customerName as string) || "Traveler"}
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${STATUS_PILL[(order.status as string)] ?? "bg-gray-100 text-gray-600"}`}>
                                                    {order.status as string}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-4 gap-3 py-3 border-y border-gray-100">
                                                {[
                                                    { label: "Date",     value: formatDate((order.dates as Record<string, unknown>)?.from || order.startDate) },
                                                    { label: "Group",    value: String(((order.travelerDetails as Record<string, unknown>)?.groupSize) || (order.groupSize as number) || 1) },
                                                    { label: "Amount",   value: `৳${((order.totalAmount as number) || (order.totalPrice as number) || 0).toLocaleString()}` },
                                                    { label: "WhatsApp", value: (((order.travelerDetails as Record<string, string>)?.whatsappNumber) || "—") },
                                                ].map(({ label, value }) => (
                                                    <div key={label}>
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{label}</p>
                                                        <p className="text-sm font-semibold text-gray-700 mt-0.5">{value}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {((order.travelerDetails as Record<string, string>)?.specialRequests) && (
                                                <div className="mt-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-500">
                                                    <span className="font-semibold text-gray-700">Note: </span>
                                                    {(order.travelerDetails as Record<string, string>).specialRequests}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-end gap-2 mt-3">
                                                {order.status === "pending" && (
                                                    <>
                                                        <Button
                                                            variant="outline" size="sm"
                                                            onClick={() => handleOrderAction(order.id as string, "cancelled")}
                                                            disabled={actionLoading === order.id}
                                                            className="rounded-full h-8 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                                                        >
                                                            {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                                                            Decline
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOrderAction(order.id as string, "confirmed")}
                                                            disabled={actionLoading === order.id}
                                                            className="rounded-full h-8 px-3 text-xs bg-[#067c18] hover:bg-[#055f12]"
                                                        >
                                                            {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                                            Accept
                                                        </Button>
                                                    </>
                                                )}
                                                {order.status === "confirmed" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOrderAction(order.id as string, "completed")}
                                                        disabled={actionLoading === order.id}
                                                        className="rounded-full h-8 px-3 text-xs bg-[#8e63f0] hover:bg-[#7654d6]"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                                                        Mark Completed
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Feed */}
                    {activeTab === "feed" && (
                        <GuideFeed
                            guideId={user?.uid || ""}
                            guideAvatar={(guideProfile?.avatarUrl as string) || dbUser?.photoURL || user?.photoURL || ""}
                            guideName={(guideProfile?.name as string) || dbUser?.displayName || user?.displayName || "Guide"}
                        />
                    )}

                    {/* Earnings */}
                    {activeTab === "earnings" && (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-[#067c18]/5 px-5 py-4 border-b border-[#067c18]/10">
                                    <h3 className="font-bold text-gray-900" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Earnings Summary</h3>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {[
                                        { label: "Gross Earnings (Completed)", value: `৳${totalEarnings.toLocaleString()}`, color: "text-gray-900" },
                                        { label: "Platform Fee (10%)",          value: `-৳${platformFee.toLocaleString()}`, color: "text-red-500" },
                                        { label: "Net Payout",                  value: `৳${paidEarnings.toLocaleString()}`, color: "text-[#067c18] text-lg font-extrabold" },
                                        { label: "Upcoming (Confirmed)",        value: `৳${pendingEarnings.toLocaleString()}`, color: "text-amber-600" },
                                    ].map(row => (
                                        <div key={row.label} className="flex items-center justify-between px-5 py-4">
                                            <span className="text-sm text-gray-600">{row.label}</span>
                                            <span className={`font-bold text-sm ${row.color}`}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-3" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Transaction History</h3>
                                {completedOrders.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <CreditCard className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                        <p className="text-sm text-gray-400">No completed transactions yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {completedOrders.map((order) => (
                                            <div key={order.id as string} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)] transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-[#067c18]/10 flex items-center justify-center shrink-0">
                                                        <CheckCircle className="h-4 w-4 text-[#067c18]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {(order.title as string) || `Booking #${(order.id as string).slice(0, 6)}`}
                                                        </p>
                                                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <p className="font-bold text-[#067c18]">
                                                    +৳{Math.round(((order.totalAmount as number) || (order.totalPrice as number) || 0) * 0.9).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
