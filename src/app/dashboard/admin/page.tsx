"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CheckCircle, XCircle, GraduationCap, CreditCard, Loader2, Eye } from "lucide-react";

interface PendingGuide {
    id: string;
    name: string;
    email?: string;
    nogoriStatus: string;
    studentIdUrl?: string;
    isStudentEmail?: boolean;
    avatarUrl?: string;
}

interface PendingNid {
    id: string;
    displayName: string;
    email: string;
    nidUrl: string;
    nidStatus: string;
}

export default function AdminDashboard() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    const [pendingGuides, setPendingGuides] = useState<PendingGuide[]>([]);
    const [pendingNids, setPendingNids] = useState<PendingNid[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Auth Guard — admin only
    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "admin") router.push(`/dashboard/${dbUser.role}`);
        }
    }, [user, dbUser, loading, router]);

    // Fetch pending verifications
    useEffect(() => {
        const fetchPending = async () => {
            try {
                // Fetch guides with id_submitted status
                const guidesQuery = query(
                    collection(db, "guides"),
                    where("nogoriStatus", "==", "id_submitted")
                );
                const guidesSnap = await getDocs(guidesQuery);
                const guides = guidesSnap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                })) as PendingGuide[];
                setPendingGuides(guides);

                // Fetch users with NID submitted
                const nidQuery = query(
                    collection(db, "users"),
                    where("nidStatus", "==", "submitted")
                );
                const nidSnap = await getDocs(nidQuery);
                const nids = nidSnap.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                })) as PendingNid[];
                setPendingNids(nids);
            } catch (error) {
                console.error("Error fetching pending verifications:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") {
            fetchPending();
        }
    }, [user, dbUser]);

    const handleGuideAction = async (guideId: string, action: "verified" | "rejected") => {
        setActionLoading(guideId);
        try {
            await updateDoc(doc(db, "guides", guideId), {
                nogoriStatus: action,
            });
            setPendingGuides(prev => prev.filter(g => g.id !== guideId));
        } catch (error) {
            console.error("Error updating guide status:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleNidAction = async (userId: string, action: "verified" | "rejected") => {
        setActionLoading(userId);
        try {
            await updateDoc(doc(db, "users", userId), {
                nidStatus: action,
                updatedAt: serverTimestamp(),
            });
            setPendingNids(prev => prev.filter(n => n.id !== userId));
        } catch (error) {
            console.error("Error updating NID status:", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading || dbUser?.role !== "admin") return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Panel</h1>
                </div>
                <p className="text-slate-500 ml-13">Review and approve guide and customer verifications.</p>
            </div>

            <Tabs defaultValue="guides" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <TabsTrigger value="guides" className="rounded-lg font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Guide Verifications
                        {pendingGuides.length > 0 && (
                            <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                                {pendingGuides.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="nid" className="rounded-lg font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm gap-2">
                        <CreditCard className="h-4 w-4" />
                        NID Verifications
                        {pendingNids.length > 0 && (
                            <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                                {pendingNids.length}
                            </span>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* ─── Guide Verifications Tab ─────────────────── */}
                <TabsContent value="guides" className="mt-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="w-full h-36 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : pendingGuides.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
                            <p className="text-slate-500">No pending guide verifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingGuides.map((guide) => (
                                <Card key={guide.id} className="p-6 rounded-2xl border-slate-200 dark:border-slate-800">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Guide Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            {guide.avatarUrl ? (
                                                <img src={guide.avatarUrl} alt={guide.name} className="h-12 w-12 rounded-xl object-cover" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg">
                                                    {guide.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{guide.name}</h3>
                                                {guide.email && (
                                                    <p className="text-sm text-slate-500">{guide.email}</p>
                                                )}
                                                <div className="flex items-center gap-2 mt-2">
                                                    {guide.isStudentEmail && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                                                            <GraduationCap className="h-3 w-3" />
                                                            Student Email
                                                        </span>
                                                    )}
                                                    {guide.studentIdUrl && (
                                                        <button
                                                            onClick={() => setPreviewImage(guide.studentIdUrl!)}
                                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                            View Student ID
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleGuideAction(guide.id, "rejected")}
                                                disabled={actionLoading === guide.id}
                                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {actionLoading === guide.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                                                Reject
                                            </Button>
                                            <Button
                                                onClick={() => handleGuideAction(guide.id, "verified")}
                                                disabled={actionLoading === guide.id}
                                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {actionLoading === guide.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1.5" />}
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* ─── NID Verifications Tab ───────────────────── */}
                <TabsContent value="nid" className="mt-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="w-full h-36 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : pendingNids.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
                            <p className="text-slate-500">No pending NID verifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingNids.map((nid) => (
                                <Card key={nid.id} className="p-6 rounded-2xl border-slate-200 dark:border-slate-800">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-lg">
                                                {nid.displayName?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{nid.displayName}</h3>
                                                <p className="text-sm text-slate-500">{nid.email}</p>
                                                {nid.nidUrl && (
                                                    <button
                                                        onClick={() => setPreviewImage(nid.nidUrl)}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors cursor-pointer mt-2"
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View NID Card
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleNidAction(nid.id, "rejected")}
                                                disabled={actionLoading === nid.id}
                                                className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {actionLoading === nid.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-1.5" />}
                                                Reject
                                            </Button>
                                            <Button
                                                onClick={() => handleNidAction(nid.id, "verified")}
                                                disabled={actionLoading === nid.id}
                                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                {actionLoading === nid.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1.5" />}
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* ─── Image Preview Modal ────────────────────────── */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-2xl w-full max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={previewImage}
                            alt="Verification document"
                            className="w-full max-h-[80vh] object-contain rounded-2xl bg-white"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewImage(null)}
                            className="absolute top-3 right-3 rounded-lg bg-white/90 shadow-lg"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
