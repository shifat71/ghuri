"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera, Trash2, Globe, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CreatePost } from "./CreatePost";

interface GuidePost {
    id: string;
    guideId: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: string;
    createdAt: any;
    likes: number;
}

interface GuideFeedProps {
    guideId: string;
    guideAvatar: string;
    guideName: string;
}

export function GuideFeed({ guideId, guideAvatar, guideName }: GuideFeedProps) {
    const { user } = useAuth();
    const [posts, setPosts] = useState<GuidePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
    const [heartAnimation, setHeartAnimation] = useState<string | null>(null);

    const isOwner = user?.uid === guideId;

    const fetchPosts = useCallback(async () => {
        if (!guideId) return;
        try {
            const q = query(
                collection(db, "guide_posts"),
                where("guideId", "==", guideId),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            setPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as GuidePost[]);
        } catch (error) {
            console.error("Error fetching guide posts:", error);
        } finally {
            setLoading(false);
        }
    }, [guideId]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleLike = async (postId: string) => {
        const alreadyLiked = likedPosts.has(postId);
        setLikedPosts(prev => {
            const next = new Set(prev);
            alreadyLiked ? next.delete(postId) : next.add(postId);
            return next;
        });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + (alreadyLiked ? -1 : 1) } : p));
        if (!alreadyLiked) {
            setHeartAnimation(postId);
            setTimeout(() => setHeartAnimation(null), 600);
        }
        try {
            await updateDoc(doc(db, "guide_posts", postId), { likes: increment(alreadyLiked ? -1 : 1) });
        } catch (error) { console.error("Error toggling like:", error); }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Delete this post?")) return;
        try {
            await deleteDoc(doc(db, "guide_posts", postId));
            setPosts(prev => prev.filter(p => p.id !== postId));
        } catch (error) { console.error("Error deleting post:", error); }
    };

    const handleDoubleTap = (postId: string) => {
        if (!likedPosts.has(postId)) handleLike(postId);
        setHeartAnimation(postId);
        setTimeout(() => setHeartAnimation(null), 600);
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays > 7) return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined });
            if (diffDays > 0) return `${diffDays}d ago`;
            if (diffHours > 0) return `${diffHours}h ago`;
            if (diffMins > 0) return `${diffMins}m ago`;
            return "Just now";
        } catch { return "Just now"; }
    };

    // Skeleton loading
    if (loading) {
        return (
            <div className="flex flex-col gap-4 w-full">
                {isOwner && <CreatePost onPostCreated={fetchPosts} />}
                {[1, 2].map(i => (
                    <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="space-y-2 flex-1"><div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-28" /><div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-20" /></div>
                        </div>
                        <div className="px-4 pb-3 space-y-2"><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" /><div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" /></div>
                        <div className="h-56 bg-slate-100 dark:bg-slate-800" />
                        <div className="p-4"><div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" /></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {isOwner && <CreatePost onPostCreated={fetchPosts} />}

            {/* Empty States */}
            {posts.length === 0 && (
                <div className="text-center py-14 px-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <Camera className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {isOwner ? "Share your first post!" : "No posts yet"}
                    </h3>
                    <p className="text-slate-500 mt-1 text-sm max-w-xs mx-auto">
                        {isOwner ? "Upload a photo or video to share with travelers." : "This guide hasn't shared any updates yet."}
                    </p>
                </div>
            )}

            {/* Posts */}
            {posts.map((post) => {
                const isLiked = likedPosts.has(post.id);
                return (
                    <div key={post.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-shadow hover:shadow-sm">

                        {/* ─── Header ─── */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 shrink-0 ring-1 ring-slate-200">
                                    {guideAvatar ? (
                                        <img src={guideAvatar} alt={guideName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm">
                                            {guideName?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px] text-slate-900 dark:text-white leading-tight">{guideName}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <span>{formatTimestamp(post.createdAt)}</span>
                                        <span>·</span>
                                        <Globe className="h-3 w-3" />
                                    </div>
                                </div>
                            </div>
                            {isOwner && (
                                <button onClick={() => handleDelete(post.id)} className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 transition-colors" title="Delete post">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* ─── Text Content (above media) ─── */}
                        {post.content && (
                            <div className="px-4 pb-3">
                                <p className={`text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words leading-relaxed ${post.content.length < 100 && !post.imageUrl && !post.videoUrl ? 'text-xl font-medium' : 'text-[15px]'}`}>
                                    {post.content}
                                </p>
                            </div>
                        )}

                        {/* ─── Image ─── */}
                        {post.imageUrl && (
                            <div className="relative w-full bg-slate-100 dark:bg-slate-800 cursor-pointer select-none" onDoubleClick={() => handleDoubleTap(post.id)}>
                                <img src={post.imageUrl} alt="Post" className="w-full max-h-[600px] object-cover" loading="lazy" />
                                {heartAnimation === post.id && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Heart className="h-20 w-20 text-red-500 fill-red-500 drop-shadow-lg" style={{ animation: 'fbReact 0.6s ease-out forwards' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Video ─── */}
                        {post.videoUrl && (
                            <div className="w-full bg-black">
                                <video src={post.videoUrl} controls playsInline preload="metadata" className="w-full max-h-[600px] object-contain" />
                            </div>
                        )}

                        {/* ─── Instagram-style Actions ─── */}
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className="transition-transform active:scale-125"
                                >
                                    <Heart className={`h-6 w-6 transition-all ${isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-900 dark:text-white hover:text-slate-500'}`} />
                                </button>
                                <button className="text-slate-900 dark:text-white hover:text-slate-500 transition-colors active:scale-110">
                                    <MessageCircle className="h-6 w-6" />
                                </button>
                                <button className="text-slate-900 dark:text-white hover:text-slate-500 transition-colors active:scale-110">
                                    <Share2 className="h-6 w-6" />
                                </button>
                            </div>
                            <button
                                onClick={() => {/* bookmark logic */ }}
                                className="text-slate-900 dark:text-white hover:text-slate-500 transition-transform active:scale-125"
                            >
                                <Bookmark className={`h-6 w-6`} />
                            </button>
                        </div>

                        {/* ─── Likes count ─── */}
                        <div className="px-4 pb-3">
                            {post.likes > 0 && (
                                <p className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
                                    {post.likes.toLocaleString()} {post.likes === 1 ? 'like' : 'likes'}
                                </p>
                            )}
                        </div>

                    </div>
                );
            })}

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes fbReact {
                    0% { transform: scale(0) rotate(-15deg); opacity: 1; }
                    50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
                    100% { transform: scale(1) rotate(0deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
