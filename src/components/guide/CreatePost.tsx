"use client";

import { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Video, X, Send, Loader2 } from "lucide-react";

interface CreatePostProps {
    onPostCreated?: () => void;
}

export function CreatePost({ onPostCreated }: CreatePostProps) {
    const { user, dbUser } = useAuth();
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            alert("Please select an image or video file.");
            return;
        }

        // 50MB limit
        if (file.size > 50 * 1024 * 1024) {
            alert("File too large. Max 50MB.");
            return;
        }

        setMediaFile(file);
        setMediaType(isImage ? "image" : "video");
        setMediaPreview(URL.createObjectURL(file));
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setMediaType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePost = async () => {
        if (!user || !content.trim()) return;
        setIsPosting(true);
        setUploadProgress(0);

        try {
            let mediaUrl: string | null = null;
            let uploadedMediaType: string | null = null;

            // Upload file if selected
            if (mediaFile) {
                const ext = mediaFile.name.split(".").pop();
                const fileName = `guide_posts/${user.uid}/${Date.now()}.${ext}`;
                const storageRef = ref(storage, fileName);

                const uploadTask = uploadBytesResumable(storageRef, mediaFile);

                mediaUrl = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                            setUploadProgress(progress);
                        },
                        (error) => reject(error),
                        async () => {
                            const url = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(url);
                        }
                    );
                });

                uploadedMediaType = mediaType;
            }

            await addDoc(collection(db, "guide_posts"), {
                guideId: user.uid,
                content,
                imageUrl: uploadedMediaType === "image" ? mediaUrl : null,
                videoUrl: uploadedMediaType === "video" ? mediaUrl : null,
                mediaType: uploadedMediaType,
                createdAt: serverTimestamp(),
                likes: 0,
            });

            // Reset
            setContent("");
            clearMedia();
            onPostCreated?.();
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setIsPosting(false);
            setUploadProgress(0);
        }
    };

    return (
        <Card className="p-4 md:p-5 rounded-2xl md:rounded-3xl border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 text-sm font-bold border border-teal-100">
                    {user?.displayName?.charAt(0)?.toUpperCase() || "G"}
                </div>

                <div className="flex-1 flex flex-col gap-3">
                    <Textarea
                        placeholder="Share a travel tip, a moment from your recent trip, or an update for your community..."
                        className="resize-none min-h-[70px] bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-base placeholder:text-slate-400"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />

                    {/* Media Preview */}
                    {mediaPreview && (
                        <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            <button
                                onClick={clearMedia}
                                className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            {mediaType === "image" ? (
                                <img
                                    src={mediaPreview}
                                    alt="Preview"
                                    className="w-full max-h-[400px] object-cover"
                                />
                            ) : (
                                <video
                                    src={mediaPreview}
                                    controls
                                    className="w-full max-h-[400px] object-contain bg-black"
                                />
                            )}
                        </div>
                    )}

                    {/* Upload Progress */}
                    {isPosting && uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*,video/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-xl text-slate-500 hover:text-teal-600 hover:bg-teal-50 gap-1.5 text-xs font-semibold"
                                disabled={isPosting}
                            >
                                <ImagePlus className="h-4 w-4" />
                                Photo
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-xl text-slate-500 hover:text-purple-600 hover:bg-purple-50 gap-1.5 text-xs font-semibold"
                                disabled={isPosting}
                            >
                                <Video className="h-4 w-4" />
                                Video
                            </Button>
                        </div>

                        <Button
                            size="sm"
                            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-5 gap-1.5"
                            disabled={!content.trim() || isPosting}
                            onClick={handlePost}
                        >
                            {isPosting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-3.5 w-3.5" />
                            )}
                            {isPosting ? (uploadProgress > 0 ? `${uploadProgress}%` : "Posting...") : "Post"}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
