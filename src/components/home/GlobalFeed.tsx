"use client";

import { useEffect, useState } from "react";
import { collection, query, limit, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Globe, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface GlobalPost {
    id: string;
    guideId: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    createdAt: unknown;
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

    const formatTimestamp = (timestamp: unknown) => {
        if (!timestamp) return "Just now";
        try {
            const date = (timestamp as { toDate?: () => Date }).toDate ? (timestamp as { toDate: () => Date }).toDate() : new Date(timestamp as string | number);
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
            <div className="flex flex-col gap-8 w-full">
                {[1, 2].map(i => (
                    <div key={i} className="animate-pulse bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                        <div className="p-6 flex gap-4 h-24 items-center">
                             <div className="h-12 w-12 bg-gray-200 rounded-full" />
                             <div className="space-y-3"><div className="h-3 w-32 bg-gray-200 rounded" /><div className="h-2 w-16 bg-gray-100 rounded" /></div>
                        </div>
                        <div className="h-[400px] w-full bg-gray-50" />
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) return null;

    return (
        <div className="flex flex-col gap-10 w-full">
            {posts.map((post, idx) => (
                <motion.div 
                    key={post.id} 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 flex flex-col"
                >
                    
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4">
                        <Link href={`/guides/${post.guideId}`} className="flex items-center gap-4 group">
                            <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border border-gray-100 group-hover:border-[#067c18]/30 transition-all shadow-sm">
                                {post.guideAvatar ? (
                                    <img src={post.guideAvatar} alt={post.guideName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-[#067c18]/10 flex items-center justify-center text-[#067c18] font-bold text-lg">
                                        {post.guideName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-base leading-tight group-hover:text-[#067c18] transition-colors" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                                    {post.guideName}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-1">
                                    <span>{formatTimestamp(post.createdAt)}</span>
                                    <span>·</span>
                                    <Globe className="h-3 w-3" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Content */}
                    {post.content && (
                        <div className="px-6 pb-5">
                            <p className="text-gray-600 whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">
                                {post.content}
                            </p>
                        </div>
                    )}

                    {/* Media Container (Main Content Area) */}
                    <div className="w-full relative">
                        {post.imageUrl && (
                            <img 
                                src={post.imageUrl} 
                                alt="Post" 
                                className="w-full h-auto max-h-[700px] object-cover transition-transform duration-700 hover:scale-[1.02]" 
                                loading="lazy" 
                            />
                        )}
                        {post.videoUrl && (
                            <video 
                                src={post.videoUrl} 
                                controls 
                                playsInline 
                                className="w-full h-auto max-h-[700px] bg-black object-contain" 
                            />
                        )}
                    </div>

                    {/* Actions Bar */}
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50 bg-[#fafafa]/50">
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors group">
                                <Heart className="h-5 w-5 group-hover:fill-red-500 transition-all duration-300" />
                                {post.likes > 0 && <span className="font-bold text-sm">{post.likes}</span>}
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                                <MessageCircle className="h-5 w-5" />
                            </button>
                            <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>
                        <button className="px-3 py-1.5 rounded-full hover:bg-[#067c18]/10 text-gray-400 hover:text-[#067c18] transition-colors">
                            <Bookmark className="h-5 w-5" />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
