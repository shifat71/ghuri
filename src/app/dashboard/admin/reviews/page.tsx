"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquareWarning, Star, Trash2, CheckCircle2, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminReviewsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.uid || dbUser?.role !== "admin") return;
            try {
                const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                // Mock some data if collection doesn't exist
                setReviews([
                    {
                        id: '1',
                        customerName: 'Ayman Sadiq',
                        guideName: 'Asfikur Rahman',
                        rating: 5,
                        comment: 'Best tour ever! Highly recommended.',
                        status: 'published',
                        createdAt: { toDate: () => new Date() }
                    },
                    {
                        id: '2',
                        customerName: 'Spam User',
                        guideName: 'John Doe',
                        rating: 1,
                        comment: 'Follow me on instagram for free iphones! http://spam.com',
                        status: 'flagged',
                        createdAt: { toDate: () => new Date() }
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "admin") fetchReviews();
    }, [user, dbUser]);

    const handleAction = async (reviewId: string, action: 'published' | 'deleted') => {
        try {
            if (action === 'deleted') {
                if (confirm("Are you sure you want to delete this review?")) {
                    // await deleteDoc(doc(db, "reviews", reviewId));
                    setReviews(prev => prev.filter(r => r.id !== reviewId));
                }
            } else {
                await updateDoc(doc(db, "reviews", reviewId), { status: action });
                setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, status: action } : r));
            }
        } catch (error) {
            console.error("Error updating review:", error);
            alert("Failed to perform action.");
        }
    };

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    const filteredReviews = reviews.filter(r => 
        (r.comment || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (r.guideName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Review Moderation</h1>
                <p className="text-slate-500">Monitor platform feedback, remove spam, and handle flagged reviews.</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                        placeholder="Search review texts or guides..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-white dark:bg-slate-900 rounded-xl border-slate-200 shadow-sm"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredReviews.length === 0 ? (
                    <Card className="p-12 text-center rounded-3xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No reviews found.</p>
                    </Card>
                ) : filteredReviews.map((review) => (
                    <Card key={review.id} className={`p-6 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 ${review.status === 'flagged' ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50' : ''}`}>
                        <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold">{review.customerName || "Traveler"}</h3>
                                        <span className="text-slate-400">→</span>
                                        <span className="font-bold text-slate-600">{review.guideName || "Guide"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-amber-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-500' : 'text-slate-300'}`} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium">
                                            {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Unknown Date'}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                    review.status === 'flagged' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-800'
                                }`}>
                                    {review.status || 'published'}
                                </Badge>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-slate-700 dark:text-slate-300 italic border border-slate-100 dark:border-slate-800 relative">
                                {review.status === 'flagged' && <MessageSquareWarning className="absolute -top-3 -right-3 h-6 w-6 text-red-500 bg-white dark:bg-slate-950 rounded-full" />}
                                "{review.comment}"
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[140px] border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 justify-center">
                            {review.status === 'flagged' && (
                                <Button onClick={() => handleAction(review.id, 'published')} variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-10 rounded-xl">
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                                </Button>
                            )}
                            <Button onClick={() => handleAction(review.id, 'deleted')} variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 h-10 rounded-xl">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
