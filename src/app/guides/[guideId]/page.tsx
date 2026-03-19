"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { Star, CheckCircle, MapPin, CalendarDays, Camera, Compass, Share, Pencil, X, Check, Plus, Trash2, ImagePlus, Languages, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { GuideFeed } from "@/components/guide/GuideFeed";
import { Calendar } from "@/components/ui/calendar";
import dynamic from "next/dynamic";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// Dynamically import map with SSR disabled
const GuidePublicMap = dynamic(
    () => import("@/components/maps/GuidePublicMap"),
    { 
        ssr: false,
        loading: () => <div className="h-[350px] w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl flex items-center justify-center font-bold text-slate-400 text-xs">Loading Map...</div>
    }
);
import { updateProfile } from "firebase/auth";
import { db, storage } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/AuthContext";

// Inline Editable Text Component
function EditableText({ value, onSave, isOwner, tag = "p", className = "", placeholder = "Click to edit...", multiline = false }: {
    value: string;
    onSave: (val: string) => void;
    isOwner: boolean;
    tag?: string;
    className?: string;
    placeholder?: string;
    multiline?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

    useEffect(() => { setDraft(value); }, [value]);
    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    if (!isOwner) {
        const Tag = tag as any;
        return <Tag className={className}>{value || placeholder}</Tag>;
    }

    if (editing) {
        return (
            <div className="flex items-start gap-2 w-full">
                {multiline ? (
                    <textarea
                        ref={inputRef as any}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 border border-teal-300 rounded-xl px-3 py-2 text-sm resize-none min-h-[80px] outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={placeholder}
                    />
                ) : (
                    <input
                        ref={inputRef as any}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-800 border border-teal-300 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder={placeholder}
                    />
                )}
                <button onClick={() => { onSave(draft); setEditing(false); }}
                    className="h-8 w-8 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-600 shrink-0">
                    <Check className="h-4 w-4" />
                </button>
                <button onClick={() => { setDraft(value); setEditing(false); }}
                    className="h-8 w-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 shrink-0">
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    const Tag = tag as any;
    return (
        <Tag
            className={`${className} cursor-pointer group/edit relative hover:bg-teal-50/50 dark:hover:bg-teal-900/10 rounded-lg transition-colors px-1 -mx-1`}
            onClick={() => setEditing(true)}
        >
            {value || <span className="text-slate-400 italic">{placeholder}</span>}
            <Pencil className="h-3 w-3 text-teal-500 opacity-0 group-hover/edit:opacity-100 transition-opacity inline-block ml-2 align-middle" />
        </Tag>
    );
}

export default function GuideProfilePage({ params }: { params: Promise<{ guideId: string }> }) {
    const { guideId } = use(params);
    const { user } = useAuth();
    const [guide, setGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [uploadingImage, setUploadingImage] = useState<string | null>(null); // which field is uploading

    // Hidden file input refs
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const portfolioInputRef = useRef<HTMLInputElement>(null);

    // Upload file to Firebase Storage and return the download URL
    const uploadFile = async (file: File, path: string): Promise<string> => {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        return new Promise((resolve, reject) => {
            uploadTask.on(
                "state_changed",
                null,
                (error) => reject(error),
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve(url);
                }
            );
        });
    };

    const handleImageUpload = async (file: File, field: string) => {
        if (!user || !isOwner) return;
        setUploadingImage(field);
        setSaveMessage("Uploading...");
        try {
            const ext = file.name.split(".").pop();
            const path = `guide_profiles/${user.uid}/${field}_${Date.now()}.${ext}`;
            const url = await uploadFile(file, path);
            await saveField(field, url);
        } catch (error) {
            console.error("Upload failed:", error);
            setSaveMessage("Upload failed");
            setTimeout(() => setSaveMessage(""), 3000);
        } finally {
            setUploadingImage(null);
        }
    };

    const handlePortfolioUpload = async (file: File) => {
        if (!user || !isOwner) return;
        setUploadingImage("portfolio");
        setSaveMessage("Uploading...");
        try {
            const ext = file.name.split(".").pop();
            const path = `guide_profiles/${user.uid}/portfolio_${Date.now()}.${ext}`;
            const url = await uploadFile(file, path);
            await saveField("portfolio", [...(guide.portfolio || []), url]);
        } catch (error) {
            console.error("Upload failed:", error);
            setSaveMessage("Upload failed");
            setTimeout(() => setSaveMessage(""), 3000);
        } finally {
            setUploadingImage(null);
        }
    };

    const isOwner = user?.uid === guideId;

    const fetchGuide = async () => {
        if (!guideId) return;
        try {
            const docRef = doc(db, "guides", guideId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setGuide({ id: docSnap.id, ...docSnap.data() });
            }
        } catch (error) {
            console.error("Error fetching guide:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGuide(); }, [guideId]);

    const saveField = async (field: string, value: any) => {
        if (!isOwner || !user) return;
        setSaving(true);
        try {
            await updateDoc(doc(db, "guides", guideId), { [field]: value });

            // Also sync name/avatar to auth profile and users collection
            if (field === "name") {
                await updateProfile(user, { displayName: value });
                await updateDoc(doc(db, "users", user.uid), { displayName: value });
            }
            if (field === "avatarUrl") {
                await updateProfile(user, { photoURL: value });
                await updateDoc(doc(db, "users", user.uid), { photoURL: value });
            }

            setGuide((prev: any) => ({ ...prev, [field]: value }));
            setSaveMessage("Saved!");
            setTimeout(() => setSaveMessage(""), 2000);
        } catch (error) {
            console.error("Error saving:", error);
            setSaveMessage("Failed to save");
            setTimeout(() => setSaveMessage(""), 3000);
        } finally {
            setSaving(false);
        }
    };

    // Service management
    const addService = async () => {
        const newService = { id: `s_${Date.now()}`, title: "New Service", category: "guided_tour", price: 0, priceType: "per_day", description: "" };
        const updated = [...(guide.services || []), newService];
        await saveField("services", updated);
    };

    const removeService = async (index: number) => {
        const updated = guide.services.filter((_: any, i: number) => i !== index);
        await saveField("services", updated);
    };

    const updateService = async (index: number, field: string, value: any) => {
        const updated = [...guide.services];
        updated[index] = { ...updated[index], [field]: value };
        await saveField("services", updated);
    };

    // Tags editor (locations, languages)
    const saveTagList = async (field: string, csvString: string) => {
        const arr = csvString.split(",").map(s => s.trim()).filter(Boolean);
        await saveField(field, arr);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Compass className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Guide Not Found</h1>
                <Link href="/" className="text-primary mt-4 hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-0">

            {/* Save indicator */}
            {saveMessage && (
                <div className="fixed top-20 right-4 z-50 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg animate-in fade-in slide-in-from-right">
                    {saveMessage}
                </div>
            )}

            {/* Hidden file inputs */}
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "avatarUrl"); e.target.value = ""; }} />
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, "coverUrl"); e.target.value = ""; }} />
            <input ref={portfolioInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePortfolioUpload(f); e.target.value = ""; }} />

            {/* Cover Photo */}
            <div className="relative w-full h-48 md:h-64 lg:h-80 bg-slate-200 group/cover">
                {guide.coverUrl ? (
                    <img src={guide.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-600" />
                )}
                <div className="absolute inset-0 bg-black/20" />

                {/* Upload overlay for cover */}
                {uploadingImage === "coverUrl" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 text-white font-semibold"><Compass className="h-5 w-5 animate-spin" /> Uploading...</div>
                    </div>
                )}

                {/* Top actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    {isOwner && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-800 gap-1.5 text-xs"
                            onClick={() => coverInputRef.current?.click()}
                            disabled={uploadingImage === "coverUrl"}
                        >
                            <ImagePlus className="h-3.5 w-3.5" />
                            Change Cover
                        </Button>
                    )}
                    <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-800">
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 relative">

                {/* Profile Info Card */}
                <div className="relative -mt-16 md:-mt-24 bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">

                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                        {/* Avatar */}
                        <div
                            className={`relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden shrink-0 bg-slate-200 ${isOwner ? 'cursor-pointer group/avatar' : ''}`}
                            onClick={() => { if (isOwner) avatarInputRef.current?.click(); }}
                        >
                            {guide.avatarUrl ? (
                                <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-teal-50 flex items-center justify-center text-teal-400 text-3xl font-bold">
                                    {guide.name?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                            {isOwner && uploadingImage === "avatarUrl" ? (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Compass className="h-6 w-6 text-white animate-spin" />
                                </div>
                            ) : isOwner ? (
                                <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/40 transition-colors flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                </div>
                            ) : null}
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                <EditableText
                                    value={guide.name}
                                    onSave={(val) => saveField("name", val)}
                                    isOwner={isOwner}
                                    tag="h1"
                                    className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white"
                                    placeholder="Your name"
                                />
                                <Badge className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm space-x-1 shrink-0">
                                    <span>🛡️</span>
                                    <span>Nogori {guide.nogoriStatus === 'pro' ? 'Pro' : 'Verified'}</span>
                                </Badge>
                            </div>

                            <EditableText
                                value={guide.tagline}
                                onSave={(val) => saveField("tagline", val)}
                                isOwner={isOwner}
                                className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base mb-3 max-w-2xl"
                                placeholder="Add a tagline..."
                            />

                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{guide.rating || 0} ({guide.reviews || 0} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {isOwner ? (
                                        <EditableText
                                            value={guide.locations?.join(", ") || ""}
                                            onSave={(val) => saveTagList("locations", val)}
                                            isOwner={isOwner}
                                            tag="span"
                                            className="text-sm"
                                            placeholder="Add locations..."
                                        />
                                    ) : (
                                        <span>{guide.locations?.join(", ")}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span>{guide.trips || 0} trips</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio Section */}
                    <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About {guide.name?.split(' ')[0]}</h3>
                        <EditableText
                            value={guide.bio}
                            onSave={(val) => saveField("bio", val)}
                            isOwner={isOwner}
                            className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
                            placeholder="Tell travelers about yourself..."
                            multiline
                        />
                        <div className="mt-4 flex flex-wrap gap-2 items-center">
                            {isOwner ? (
                                <EditableText
                                    value={guide.languages?.join(", ") || ""}
                                    onSave={(val) => saveTagList("languages", val)}
                                    isOwner={isOwner}
                                    tag="span"
                                    className="text-sm"
                                    placeholder="Add languages (comma separated)..."
                                />
                            ) : (
                                guide.languages?.map((lang: string, i: number) => (
                                    <Badge key={i} variant="outline" className="bg-slate-100 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-300">
                                        {lang}
                                    </Badge>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Locations & Availability Section */}
                    {((guide.spots && guide.spots.length > 0) || (guide.unavailableDates && guide.unavailableDates.length > 0)) && (
                        <div className="mt-8 border-t border-slate-100 dark:border-slate-700 pt-8">
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Map Column */}
                                {guide.spots && guide.spots.length > 0 && (
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                                                <Navigation className="h-5 w-5 text-indigo-600" />
                                                Service Locations
                                            </h3>
                                            <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold text-slate-400">
                                                {guide.spots.length} Spots Marked
                                            </Badge>
                                        </div>
                                        
                                        {/* Textual list of spots */}
                                        <div className="flex flex-wrap gap-2 pb-2">
                                            {guide.spots.map((spot: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm">
                                                    <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                                                        {spot.label.split(',')[0]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <GuidePublicMap spots={guide.spots} />
                                    </div>
                                )}

                                {/* Availability Column */}
                                {guide.availableDates && guide.availableDates.length > 0 && (
                                    <div className="w-full lg:w-fit space-y-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
                                            <CalendarDays className="h-5 w-5 text-teal-500" />
                                            Available Dates
                                        </h3>
                                        <div className="bg-white dark:bg-slate-950 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <Calendar
                                                mode="multiple"
                                                selected={(guide.availableDates || []).map((d: string) => new Date(d))}
                                                className="p-0 pointer-events-none"
                                                classNames={{
                                                    selected: "bg-teal-50 text-teal-600 font-bold border-2 border-teal-200 rounded-xl",
                                                }}
                                            />
                                            <div className="mt-4 flex items-center gap-2 px-2">
                                                <div className="h-3 w-3 rounded-full bg-teal-100 border-2 border-teal-300" />
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Guide is Available</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modular Profile Tabs */}
                <div className="mt-8 mb-8">
                    <Tabs defaultValue="feed" className="w-full">
                        <TabsList className="w-full md:w-auto grid grid-cols-4 bg-slate-200/50 dark:bg-slate-800 p-1 mb-6 rounded-2xl">
                            <TabsTrigger value="services" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Services
                            </TabsTrigger>
                            <TabsTrigger value="feed" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Feed
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Portfolio
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Reviews
                            </TabsTrigger>
                        </TabsList>

                        {/* Services Tab */}
                        <TabsContent value="services" className="space-y-4 outline-none">
                            {isOwner && (
                                <Button variant="outline" onClick={addService} className="rounded-xl gap-2 mb-2" disabled={saving}>
                                    <Plus className="h-4 w-4" />
                                    Add Service
                                </Button>
                            )}
                            {guide.services?.map((service: any, index: number) => {
                                const Icon = Camera;
                                return (
                                    <Card key={service.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors relative group/svc">
                                        <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                {isOwner ? (
                                                    <>
                                                        <EditableText
                                                            value={service.title}
                                                            onSave={(val) => updateService(index, "title", val)}
                                                            isOwner={isOwner}
                                                            tag="h4"
                                                            className="font-semibold text-slate-900 dark:text-white text-lg"
                                                            placeholder="Service title"
                                                        />
                                                        <EditableText
                                                            value={service.description}
                                                            onSave={(val) => updateService(index, "description", val)}
                                                            isOwner={isOwner}
                                                            className="text-sm text-slate-500 dark:text-slate-400 mt-1"
                                                            placeholder="Service description"
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{service.title}</h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{service.description}</p>
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-left sm:text-right shrink-0">
                                                {isOwner ? (
                                                    <EditableText
                                                        value={String(service.price)}
                                                        onSave={(val) => updateService(index, "price", Number(val))}
                                                        isOwner={isOwner}
                                                        tag="p"
                                                        className="font-bold text-xl text-slate-900 dark:text-white"
                                                        placeholder="0"
                                                    />
                                                ) : (
                                                    <p className="font-bold text-xl text-slate-900 dark:text-white">৳{service.price}</p>
                                                )}
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{service.priceType?.replace('_', ' ')}</p>
                                            </div>
                                            {isOwner && (
                                                <button
                                                    onClick={() => removeService(index)}
                                                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover/svc:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {(!guide.services || guide.services.length === 0) && !isOwner && (
                                <div className="text-center py-12 text-slate-400 text-sm">No services listed yet.</div>
                            )}
                        </TabsContent>

                        {/* Feed Tab */}
                        <TabsContent value="feed" className="outline-none">
                            <GuideFeed guideId={guide.id} guideName={guide.name} guideAvatar={guide.avatarUrl} />
                        </TabsContent>

                        {/* Portfolio Tab */}
                        <TabsContent value="portfolio" className="outline-none">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                {guide.portfolio?.map((img: string, i: number) => (
                                    <div key={i} className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer bg-slate-100">
                                        <img src={img} alt={`Portfolio image ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        {isOwner && (
                                            <button
                                                onClick={() => {
                                                    const updated = guide.portfolio.filter((_: any, idx: number) => idx !== i);
                                                    saveField("portfolio", updated);
                                                }}
                                                className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isOwner && (
                                    <button
                                        onClick={() => portfolioInputRef.current?.click()}
                                        disabled={uploadingImage === "portfolio"}
                                        className="aspect-square rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-teal-400 hover:text-teal-500 transition-colors cursor-pointer"
                                    >
                                        {uploadingImage === "portfolio" ? (
                                            <Compass className="h-8 w-8 animate-spin" />
                                        ) : (
                                            <ImagePlus className="h-8 w-8" />
                                        )}
                                        <span className="text-xs font-medium">{uploadingImage === "portfolio" ? "Uploading..." : "Add Photo"}</span>
                                    </button>
                                )}
                            </div>
                        </TabsContent>

                        {/* Reviews Tab */}
                        <TabsContent value="reviews" className="outline-none">
                            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Reviews coming soon</h3>
                                <p className="text-sm text-slate-500 mt-1">This guide has completed {guide.trips || 0} trips.</p>
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>

            </div>

            {/* Sticky Action Bar - only for visitors */}
            {!isOwner && (
                <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-slate-500">Starting from</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">৳{guide.pricePerDay} <span className="text-sm font-normal text-slate-500">/ day</span></p>
                        </div>
                        <Button
                            size="lg"
                            className="w-full sm:w-auto sm:min-w-[200px] h-14 text-base rounded-2xl shadow-md border border-black/10 translate-y-[-1px]"
                            onClick={() => setIsBookingModalOpen(true)}
                        >
                            <CalendarDays className="mr-2 h-5 w-5" />
                            Hire Me
                        </Button>
                    </div>
                </div>
            )}

            {isBookingModalOpen && (
                <BookingWizard guide={guide} onClose={() => setIsBookingModalOpen(false)} />
            )}

        </div>
    );
}
