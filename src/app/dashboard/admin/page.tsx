"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, CheckCircle, XCircle, GraduationCap, CreditCard, Loader2, Eye, Globe, Plus, Trash2 } from "lucide-react";

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

    // Edu Domains State
    const [eduDomains, setEduDomains] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState("");
    const [isDomainsSaving, setIsDomainsSaving] = useState(false);
    const [domainsLoaded, setDomainsLoaded] = useState(false);

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

    // Fetch accepted edu domains
    useEffect(() => {
        const fetchDomains = async () => {
            try {
                const snap = await getDoc(doc(db, "settings", "accepted_edu_domains"));
                if (snap.exists()) {
                    setEduDomains(snap.data().domains || []);
                }
            } catch (error) {
                console.error("Error fetching edu domains:", error);
            } finally {
                setDomainsLoaded(true);
            }
        };

        if (user && dbUser?.role === "admin") {
            fetchDomains();
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

    const handleAddDomain = () => {
        const domain = newDomain.trim().toLowerCase();
        if (!domain || eduDomains.includes(domain)) return;
        setEduDomains(prev => [...prev, domain]);
        setNewDomain("");
    };

    const handleRemoveDomain = (domain: string) => {
        setEduDomains(prev => prev.filter(d => d !== domain));
    };

    const handleSaveDomains = async () => {
        setIsDomainsSaving(true);
        try {
            await setDoc(doc(db, "settings", "accepted_edu_domains"), {
                domains: eduDomains,
                updatedAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error saving edu domains:", error);
        } finally {
            setIsDomainsSaving(false);
        }
    };

    if (loading || dbUser?.role !== "admin") return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Panel</h1>
                </div>
                <p className="text-slate-500 ml-13">Review verifications and manage platform settings.</p>
            </div>

            <Tabs defaultValue="guides" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 h-12 bg-slate-100 rounded-xl">
                    <TabsTrigger value="guides" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span className="hidden sm:inline">Guide</span> Verifications
                        {pendingGuides.length > 0 && (
                            <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                                {pendingGuides.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="nid" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">NID</span> Verifications
                        {pendingNids.length > 0 && (
                            <span className="ml-1 h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                                {pendingNids.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="domains" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
                        <Globe className="h-4 w-4" />
                        Edu Domains
                    </TabsTrigger>
                </TabsList>

                {/* ─── Guide Verifications Tab ─────────────────── */}
                <TabsContent value="guides" className="mt-0">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="w-full h-36 bg-slate-100 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : pendingGuides.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
                            <p className="text-slate-500">No pending guide verifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingGuides.map((guide) => (
                                <Card key={guide.id} className="p-6 rounded-2xl border-slate-200">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        {/* Guide Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            {guide.avatarUrl ? (
                                                <img src={guide.avatarUrl} alt={guide.name} className="h-12 w-12 rounded-xl object-cover" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">
                                                    {guide.name?.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900">{guide.name}</h3>
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
                                <div key={i} className="w-full h-36 bg-slate-100 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : pendingNids.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <CheckCircle className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
                            <p className="text-slate-500">No pending NID verifications.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingNids.map((nid) => (
                                <Card key={nid.id} className="p-6 rounded-2xl border-slate-200">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-lg">
                                                {nid.displayName?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900">{nid.displayName}</h3>
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

                {/* ─── Edu Domains Management Tab ──────────────── */}
                <TabsContent value="domains" className="mt-0">
                    <Card className="p-6 rounded-2xl border-slate-200">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Accepted Edu Email Domains</h3>
                            <p className="text-sm text-slate-500">
                                Guides who sign up with an email from these domains are auto-verified (no admin review needed).
                                Others must upload a Student ID for manual verification.
                            </p>
                        </div>

                        {/* Add new domain */}
                        <div className="flex gap-2 mb-6">
                            <Input
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                placeholder="e.g. bracu.ac.bd"
                                className="h-10 rounded-xl flex-1"
                                onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                            />
                            <Button onClick={handleAddDomain} className="rounded-xl h-10 gap-1.5" disabled={!newDomain.trim()}>
                                <Plus className="h-4 w-4" />
                                Add
                            </Button>
                        </div>

                        {/* Domain list */}
                        {!domainsLoaded ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : eduDomains.length === 0 ? (
                            <div className="text-center py-8 text-slate-400">
                                <Globe className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No domains configured yet. Add your first accepted edu domain above, or go to <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">/dev/seed-admin</code> to seed the default list.</p>
                            </div>
                        ) : (
                            <div className="space-y-1 max-h-80 overflow-y-auto">
                                {eduDomains.map((domain) => (
                                    <div
                                        key={domain}
                                        className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 group"
                                    >
                                        <code className="text-sm text-slate-700">{domain}</code>
                                        <button
                                            onClick={() => handleRemoveDomain(domain)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all p-1 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Save button */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-xs text-slate-400">{eduDomains.length} domain{eduDomains.length !== 1 ? "s" : ""} configured</p>
                            <Button
                                onClick={handleSaveDomains}
                                disabled={isDomainsSaving}
                                className="rounded-xl bg-teal-600 hover:bg-teal-700 gap-2"
                            >
                                {isDomainsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </Card>
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
