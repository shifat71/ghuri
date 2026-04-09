"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, increment, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Heart, MessageCircle, Share2, Globe, Bookmark, Trash2, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CreatePost } from "./CreatePost";

interface GuidePost {
    id: string;
    guideId: string;
    content: string;
    imageUrl?: string;
    videoUrl?: string;
    mediaType?: string;
    createdAt: unknown;
    likes: number;
}

interface GuideFeedProps {
    guideId: string;
    guideAvatar: string;
    guideName: string;
}

function formatTimestamp(timestamp: unknown): string {
    if (!timestamp) return "Just now";
    try {
        const t = timestamp as { toDate?: () => Date };
        const date = t.toDate ? t.toDate() : new Date(timestamp as string);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays > 7) return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return "Just now";
    } catch { return "Just now"; }
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
        } catch (err) { console.error("Error fetching guide posts:", err); }
        finally { setLoading(false); }
    }, [guideId]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleLike = async (postId: string) => {
        const alreadyLiked = likedPosts.has(postId);
        setLikedPosts(prev => { const n = new Set(prev); alreadyLiked ? n.delete(postId) : n.add(postId); return n; });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + (alreadyLiked ? -1 : 1) } : p));
        if (!alreadyLiked) { setHeartAnimation(postId); setTimeout(() => setHeartAnimation(null), 600); }
        try { await updateDoc(doc(db, "guide_posts", postId), { likes: increment(alreadyLiked ? -1 : 1) }); }
        catch (err) { console.error(err); }
    };

    const handleDelete = async (postId: string) => {
        if (!confirm("Delete this post?")) return;
        try { await deleteDoc(doc(db, "guide_posts", postId)); setPosts(prev => prev.filter(p => p.id !== postId)); }
        catch (err) { console.error(err); }
    };

    const handleDoubleTap = (postId: string) => {
        if (!likedPosts.has(postId)) handleLike(postId);
        setHeartAnimation(postId);
        setTimeout(() => setHeartAnimation(null), 600);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-4 w-full">
                {isOwner && <CreatePost onPostCreated={fetchPosts} />}
                {[1, 2].map(i => (
                    <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
                        <div className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-100" />
                            <div className="space-y-2 flex-1">
                                <div className="h-3 bg-gray-100 rounded w-28" />
                                <div className="h-2 bg-gray-50 rounded w-20" />
                            </div>
                        </div>
                        <div className="px-4 pb-3 space-y-2">
                            <div className="h-3 bg-gray-50 rounded w-full" />
                            <div className="h-3 bg-gray-50 rounded w-3/4" />
                        </div>
                        <div className="h-56 bg-gray-50" />
                        <div className="p-4"><div className="h-8 bg-gray-50 rounded" /></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            {isOwner && <CreatePost onPostCreated={fetchPosts} />}

            {posts.length === 0 && (
                <div className="text-center py-14 px-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
                    <Camera className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-gray-800">
                        {isOwner ? "Share your first post!" : "No posts yet"}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                        {isOwner ? "Upload a photo or video to share with travelers." : "This guide hasn't shared any updates yet."}
                    </p>
                </div>
            )}

            {posts.map((post) => {
                const isLiked = likedPosts.has(post.id);
                return (
                    <div key={post.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">

                        {/* Header */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-2 ring-gray-100">
                                    {guideAvatar ? (
                                        <img src={guideAvatar} alt={guideName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-[#067c18]/10 flex items-center justify-center text-[#067c18] font-bold text-sm">
                                            {guideName?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px] text-gray-900 leading-tight">{guideName}</p>
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <span>{formatTimestamp(post.createdAt)}</span>
                                        <span>·</span>
                                        <Globe className="h-3 w-3" />
                                    </div>
                                </div>
                            </div>
                            {isOwner && (
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="h-8 w-8 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Delete post"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        {post.content && (
                            <div className="px-4 pb-3">
                                <p className={`text-gray-800 whitespace-pre-wrap break-words leading-relaxed ${post.content.length < 100 && !post.imageUrl && !post.videoUrl ? 'text-xl font-medium' : 'text-[15px]'}`}>
                                    {post.content}
                                </p>
                            </div>
                        )}

                        {/* Image */}
                        {post.imageUrl && (
                            <div className="relative w-full bg-gray-50 cursor-pointer select-none" onDoubleClick={() => handleDoubleTap(post.id)}>
                                <img src={post.imageUrl} alt="Post" className="w-full max-h-[600px] object-cover" loading="lazy" />
                                {heartAnimation === post.id && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Heart className="h-20 w-20 text-red-500 fill-red-500 drop-shadow-lg" style={{ animation: 'fbReact 0.6s ease-out forwards' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video */}
                        {post.videoUrl && (
                            <div className="w-full bg-gray-900">
                                <video src={post.videoUrl} controls playsInline preload="metadata" className="w-full max-h-[600px] object-contain" />
                            </div>
                        )}

                        {/* Actions */}
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between border-t border-gray-50">
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleLike(post.id)} className="transition-transform active:scale-125">
                                    <Heart className={`h-6 w-6 transition-all ${isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-500 hover:text-red-400'}`} />
                                </button>
                                <button className="text-gray-500 hover:text-gray-700 transition-colors active:scale-110">
                                    <MessageCircle className="h-6 w-6" />
                                </button>
                                <button className="text-gray-500 hover:text-gray-700 transition-colors active:scale-110">
                                    <Share2 className="h-6 w-6" />
                                </button>
                            </div>
                            <button className="text-gray-500 hover:text-[#067c18] transition-transform active:scale-125">
                                <Bookmark className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Likes count */}
                        <div className="px-4 pb-3">
                            {post.likes > 0 && (
                                <p className="font-semibold text-sm text-gray-800 mt-1">
                                    {post.likes.toLocaleString()} {post.likes === 1 ? 'like' : 'likes'}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}

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
