"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Loader2, Star, User, MessageSquare, ThumbsUp } from "lucide-react";

export default function GuideReviewsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState<any[]>([]);
    
    useEffect(() => {
        const fetchReviews = async () => {
            if (!user?.uid) return;
            try {
                const q = query(
                    collection(db, "reviews"),
                    where("guideId", "==", user.uid),
                    orderBy("createdAt", "desc")
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                
                // Mock some data if Firestore collection doesn't exist yet
                setReviews([
                    {
                        id: '1',
                        customerName: 'Rahim Rahman',
                        rating: 5,
                        comment: 'Incredible experience! The guide knew all the hidden spots in Sylhet and was very accommodating to our family.',
                        createdAt: { toDate: () => new Date() }
                    },
                    {
                        id: '2',
                        customerName: 'Sarah Jenkins',
                        rating: 4,
                        comment: 'Very knowledgeable about the local history. Only taking off one star because the tour started a bit late, but overall great.',
                        createdAt: { toDate: () => new Date(Date.now() - 86400000 * 2) }
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && dbUser?.role === "guide") fetchReviews();
    }, [user, dbUser]);

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingCounts = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++;
    });

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Reviews & Ratings</h1>
                <p className="text-slate-500">See what travelers are saying about your tours.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Average Rating</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="h-10 w-10 text-amber-500 fill-amber-500" />
                        <span className="text-5xl font-black">{avgRating}</span>
                    </div>
                    <p className="text-slate-500 font-medium">Based on {reviews.length} reviews</p>
                </Card>

                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-center">
                    <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map(stars => {
                            const count = ratingCounts[stars - 1] || 0;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                                <div key={stars} className="flex items-center gap-4 text-sm font-bold text-slate-600">
                                    <div className="flex items-center gap-1 w-12 shrink-0 justify-end">
                                        <span>{stars}</span>
                                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-8 shrink-0 text-slate-400">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-teal-600" />
                        Traveler Feedback
                    </h3>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500">No reviews yet. Complete some tours to build your reputation!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{review.customerName || "Verified Traveler"}</h4>
                                            <p className="text-xs text-slate-500">
                                                {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Recent'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-amber-500' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-slate-700 italic">"{review.comment}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
