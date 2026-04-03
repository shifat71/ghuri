"use client";

import { useEffect, useState } from "react";
import { collection, query, limit, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Globe, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import Link from "next/link";

interface GlobalPost {
    id: string;
    guideId: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: any;
    likes: number;
    guideName?: string;
    guideAvatar?: string;
}

export function GlobalFeed() {
    const [posts, setPosts] = useState<GlobalPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeed() {
            try {
                // Fetch latest 4 posts
                const q = query(
                    collection(db, "guide_posts"),
                    orderBy("createdAt", "desc"),
                    limit(4)
                );
                const snapshot = await getDocs(q);
                let rawPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GlobalPost[];

                // Fetch guide profiles for these posts
                const guideCache = new Map<string, any>();
                for (let post of rawPosts) {
                    if (!guideCache.has(post.guideId)) {
                        const guideDoc = await getDoc(doc(db, "guides", post.guideId));
                        if (guideDoc.exists()) {
                            guideCache.set(post.guideId, guideDoc.data());
                        }
                    }
                    const guideData = guideCache.get(post.guideId);
                    post.guideName = guideData?.name || "Verified Student";
                    post.guideAvatar = guideData?.avatarUrl || "";
                }

                setPosts(rawPosts);
            } catch (error) {
                console.error("Failed to load global feed", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeed();
    }, []);

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays > 0) return `${diffDays}d ago`;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours > 0) return `${diffHours}h ago`;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            if (diffMins > 0) return `${diffMins}m ago`;
            return "Just now";
        } catch { return "Just now"; }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
                {[1, 2].map(i => (
                    <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 flex gap-3 h-20 items-center">
                             <div className="h-10 w-10 bg-slate-200 rounded-full" />
                             <div className="space-y-2"><div className="h-3 w-24 bg-slate-200 rounded" /><div className="h-2 w-12 bg-slate-200 rounded" /></div>
                        </div>
                        <div className="h-[400px] w-full bg-slate-100" />
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            {posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-4 pb-3">
                        <Link href={`/guides/${post.guideId}`} className="flex items-center gap-3 group">
                            <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-teal-500 transition-all">
                                {post.guideAvatar ? (
                                    <img src={post.guideAvatar} alt={post.guideName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 font-bold">
                                        {post.guideName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white leading-tight group-hover:text-teal-600 transition-colors">{post.guideName}</p>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <span>{formatTimestamp(post.createdAt)}</span>
                                    <span>·</span>
                                    <Globe className="h-3 w-3" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Content */}
                    {post.content && (
                        <div className="px-5 pb-3">
                            <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">{post.content}</p>
                        </div>
                    )}

                    {/* Media */}
                    {post.imageUrl && (
                        <div className="w-full bg-slate-50 dark:bg-slate-900">
                            <img src={post.imageUrl} alt="Post" className="w-full max-h-[600px] object-cover" loading="lazy" />
                        </div>
                    )}
                    {post.videoUrl && (
                        <div className="w-full bg-black">
                            <video src={post.videoUrl} controls playsInline className="w-full max-h-[600px] object-contain" />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <button className="text-slate-900 dark:text-white hover:text-red-500 transition-colors">
                                <Heart className="h-6 w-6" />
                            </button>
                            <button className="text-slate-900 dark:text-white hover:text-slate-500 transition-colors">
                                <MessageCircle className="h-6 w-6" />
                            </button>
                            <button className="text-slate-900 dark:text-white hover:text-slate-500 transition-colors">
                                <Share2 className="h-6 w-6" />
                            </button>
                        </div>
                        <button className="text-slate-900 dark:text-white hover:text-slate-500 transition-colors">
                            <Bookmark className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
