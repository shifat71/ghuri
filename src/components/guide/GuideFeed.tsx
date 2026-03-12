"use client";

import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, MoreHorizontal, Camera, Bookmark } from "lucide-react";
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
    const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

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
            const fetchedPosts = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as GuidePost[];

            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching guide posts:", error);
        } finally {
            setLoading(false);
        }
    }, [guideId]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleLike = async (postId: string) => {
        const alreadyLiked = likedPosts.has(postId);

        // Optimistic update
        setLikedPosts(prev => {
            const next = new Set(prev);
            if (alreadyLiked) next.delete(postId);
            else next.add(postId);
            return next;
        });

        setPosts(prev => prev.map(p =>
            p.id === postId
                ? { ...p, likes: p.likes + (alreadyLiked ? -1 : 1) }
                : p
        ));

        if (!alreadyLiked) {
            setHeartAnimation(postId);
            setTimeout(() => setHeartAnimation(null), 800);
        }

        try {
            await updateDoc(doc(db, "guide_posts", postId), {
                likes: increment(alreadyLiked ? -1 : 1)
            });
        } catch (error) {
            console.error("Error toggling like:", error);
        }
    };

    const handleDoubleTap = (postId: string) => {
        if (!likedPosts.has(postId)) {
            handleLike(postId);
        } else {
            // Still show the animation for feedback
            setHeartAnimation(postId);
            setTimeout(() => setHeartAnimation(null), 800);
        }
    };

    const toggleSaved = (postId: string) => {
        setSavedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return "Just now";
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor(diffMs / (1000 * 60));

            if (diffDays > 7) return date.toLocaleDateString();
            if (diffDays > 0) return `${diffDays}d ago`;
            if (diffHours > 0) return `${diffHours}h ago`;
            if (diffMins > 0) return `${diffMins}m ago`;
            return "Just now";
        } catch {
            return "Just now";
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-6 w-full">
                {isOwner && <CreatePost onPostCreated={fetchPosts} />}
                {[1, 2].map(i => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-16" />
                                </div>
                            </div>
                            <div className="h-64 bg-slate-100 dark:bg-slate-800" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* Inline Create Post */}
            {isOwner && <CreatePost onPostCreated={fetchPosts} />}

            {/* Empty States */}
            {posts.length === 0 && !isOwner && (
                <div className="text-center py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Camera className="h-7 w-7 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No posts yet</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">This guide hasn't shared any updates or moments with the community yet.</p>
                </div>
            )}

            {posts.length === 0 && isOwner && (
                <div className="text-center py-12 px-4 bg-gradient-to-br from-teal-50/50 to-slate-50 dark:from-teal-900/10 dark:to-slate-900/50 rounded-3xl border border-dashed border-teal-200 dark:border-teal-800">
                    <Camera className="h-10 w-10 text-teal-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Share your first moment!</h3>
                    <p className="text-slate-500 mt-1 text-sm">Use the form above to post a photo, video, or update.</p>
                </div>
            )}

            {/* Posts */}
            {posts.map((post, index) => (
                <Card
                    key={post.id}
                    className="overflow-hidden border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-[28px] shadow-sm bg-white dark:bg-slate-900 transition-all duration-300 hover:shadow-md"
                    style={{ animationDelay: `${index * 80}ms` }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 px-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-emerald-500 p-[2px] shrink-0">
                                <div className="h-full w-full rounded-full overflow-hidden bg-white">
                                    {guideAvatar ? (
                                        <img src={guideAvatar} alt={guideName} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-sm">
                                            {guideName?.charAt(0)?.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-slate-900 dark:text-white leading-none">{guideName}</span>
                                <span className="text-xs text-slate-500 mt-1">{formatTimestamp(post.createdAt)}</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Image Content - Double tap to like */}
                    {post.imageUrl && (
                        <div
                            className="relative w-full bg-slate-100 dark:bg-slate-800 cursor-pointer select-none"
                            onDoubleClick={() => handleDoubleTap(post.id)}
                        >
                            <img
                                src={post.imageUrl}
                                alt="Post content"
                                className="w-full max-h-[600px] object-cover"
                                loading="lazy"
                            />
                            {/* Heart animation on double tap */}
                            {heartAnimation === post.id && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Heart
                                        className="h-20 w-20 text-white drop-shadow-lg fill-white"
                                        style={{
                                            animation: 'heartBurst 0.8s ease-out forwards'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Video Content */}
                    {post.videoUrl && (
                        <div className="w-full bg-black">
                            <video
                                src={post.videoUrl}
                                controls
                                playsInline
                                preload="metadata"
                                className="w-full max-h-[600px] object-contain"
                            />
                        </div>
                    )}

                    {/* Actions Row */}
                    <div className="p-3 px-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                className={`transition-all duration-200 active:scale-125 ${likedPosts.has(post.id) ? 'text-red-500' : 'text-slate-900 dark:text-white hover:text-red-500'}`}
                                onClick={() => handleLike(post.id)}
                            >
                                <Heart className={`h-6 w-6 transition-all ${likedPosts.has(post.id) ? 'fill-red-500 scale-110' : ''}`} />
                            </button>
                            <button className="text-slate-900 dark:text-white hover:text-blue-500 transition-colors active:scale-110">
                                <MessageCircle className="h-6 w-6" />
                            </button>
                            <button className="text-slate-900 dark:text-white hover:text-green-500 transition-colors active:scale-110">
                                <Share2 className="h-6 w-6" />
                            </button>
                        </div>
                        <button
                            className={`transition-all duration-200 active:scale-125 ${savedPosts.has(post.id) ? 'text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            onClick={() => toggleSaved(post.id)}
                        >
                            <Bookmark className={`h-6 w-6 transition-all ${savedPosts.has(post.id) ? 'fill-slate-900 dark:fill-white' : ''}`} />
                        </button>
                    </div>

                    {/* Likes & Caption */}
                    <div className="px-5 pb-5">
                        {post.likes > 0 && (
                            <p className="font-semibold text-sm mb-2 text-slate-900 dark:text-white">
                                {post.likes.toLocaleString()} {post.likes === 1 ? 'like' : 'likes'}
                            </p>
                        )}
                        <p className="text-sm text-slate-800 dark:text-slate-200 break-words leading-relaxed whitespace-pre-wrap">
                            <span className="font-bold text-slate-900 dark:text-white mr-2">{guideName}</span>
                            {post.content}
                        </p>
                    </div>
                </Card>
            ))}

            {/* CSS Animations */}
            <style jsx global>{`
                @keyframes heartBurst {
                    0% { transform: scale(0); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
