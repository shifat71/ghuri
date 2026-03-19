"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, CheckCircle2, XCircle, Search, MoreHorizontal, ShieldAlert, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminGuidesPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [guides, setGuides] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchGuides = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                const q = query(collection(db, "guides"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
                
                // Sort by pending first
                data.sort((a, b) => {
                    if (a.nogoriStatus === 'pending' && b.nogoriStatus !== 'pending') return -1;
                    if (a.nogoriStatus !== 'pending' && b.nogoriStatus === 'pending') return 1;
                    return 0;
                });
                
                setGuides(data);
            } catch (error) {
                console.error("Error fetching guides:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchGuides();
    }, [user, dbUser]);

    const handleStatusChange = async (guideId: string, newStatus: string) => {
        try {
            const isActive = newStatus === 'verified' || newStatus === 'pro' || newStatus === 'elite';
            await updateDoc(doc(db, "guides", guideId), {
                nogoriStatus: newStatus,
                isActive: isActive
            });
            setGuides(prev => prev.map(g => g.id === guideId ? { ...g, nogoriStatus: newStatus, isActive: isActive } : g));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    const filteredGuides = guides.filter(g => 
        (g.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (g.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Guide Management</h1>
                    <p className="text-slate-500">Review applications, verify identities, and manage active guides.</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-white dark:bg-slate-900 rounded-xl border-slate-200 shadow-sm"
                    />
                </div>
            </div>

            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-bold">Guide Profile</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Locations</th>
                                <th className="px-6 py-4 font-bold">Trips</th>
                                <th className="px-6 py-4 text-right font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredGuides.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No guides found matching your search.
                                    </td>
                                </tr>
                            ) : filteredGuides.map((guide) => (
                                <tr key={guide.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                                                {guide.avatarUrl ? (
                                                    <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    {guide.name || "Unknown Guide"}
                                                    {(guide.nogoriStatus === 'verified' || guide.nogoriStatus === 'pro') && (
                                                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500">{guide.email || guide.id.substring(0, 10) + "..."}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge 
                                            variant="outline" 
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                                guide.nogoriStatus === 'pending' ? 'bg-amber-100/50 text-amber-700 border-amber-200' :
                                                guide.nogoriStatus === 'verified' || guide.nogoriStatus === 'pro' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' :
                                                'bg-red-100/50 text-red-700 border-red-200'
                                            }`}
                                        >
                                            {guide.nogoriStatus}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">
                                        {Array.isArray(guide.locations) ? guide.locations.join(", ") : guide.locations || "Not set"}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-700">
                                        {guide.totalTrips || 0}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {guide.nogoriStatus === 'pending' ? (
                                                <>
                                                    <Button onClick={() => handleStatusChange(guide.id, 'verified')} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700">
                                                        <CheckCircle2 className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button onClick={() => handleStatusChange(guide.id, 'rejected')} size="sm" variant="outline" className="h-8 text-red-600 hover:bg-red-50">
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
