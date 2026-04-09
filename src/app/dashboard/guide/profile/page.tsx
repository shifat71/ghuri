"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, User, ImageIcon, MapPin, Languages, Plus, Trash2, Camera } from "lucide-react";
import Link from "next/link";

export default function GuideProfileSettings() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        avatarUrl: "",
        coverUrl: "",
        tagline: "",
        bio: "",
        locations: "", // string for comma separation in UI
        languages: "", // string for comma separation in UI
        services: [] as any[], // array of service objects
    });

    // Auth Guard & Fetch
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            } else if (dbUser && dbUser.role !== "guide") {
                router.push(`/dashboard/${dbUser.role}`);
            }
        }
    }, [user, dbUser, loading, router]);

    useEffect(() => {
        const fetchGuideProfile = async () => {
            if (!user) return;
            try {
                const docSnap = await getDoc(doc(db, "guides", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFormData({
                        name: data.name || dbUser?.displayName || user.displayName || "",
                        avatarUrl: data.avatarUrl || dbUser?.photoURL || user.photoURL || "",
                        coverUrl: data.coverUrl || "",
                        tagline: data.tagline || "",
                        bio: data.bio || "",
                        locations: data.locations?.join(", ") || "",
                        languages: data.languages?.join(", ") || "",
                        services: data.services || [],
                    });
                }
            } catch (error) {
                console.error("Error fetching guide profile:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user && dbUser?.role === "guide") {
            fetchGuideProfile();
        }
    }, [user, dbUser]);

    const addService = () => {
        setFormData(prev => ({
            ...prev,
            services: [...prev.services, {
                id: `s_${Date.now()}`,
                title: "",
                category: "guided_tour",
                price: 0,
                priceType: "per_day",
                description: ""
            }]
        }));
    };

    const removeService = (index: number) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index)
        }));
    };

    const updateService = (index: number, field: string, value: any) => {
        setFormData(prev => {
            const newServices = [...prev.services];
            newServices[index] = { ...newServices[index], [field]: value };
            return { ...prev, services: newServices };
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage({ text: "", type: "" });

        const locationsArray = formData.locations.split(",").map(i => i.trim()).filter(i => i);
        const languagesArray = formData.languages.split(",").map(i => i.trim()).filter(i => i);

        try {
            // 1. Update Core Auth Profile
            await updateProfile(user, {
                displayName: formData.name,
                photoURL: formData.avatarUrl
            });

            // 2. Update Primary User Doc
            await updateDoc(doc(db, "users", user.uid), {
                displayName: formData.name,
                photoURL: formData.avatarUrl
            });

            // 3. Update Public Guide Profile Doc
            await updateDoc(doc(db, "guides", user.uid), {
                name: formData.name,
                avatarUrl: formData.avatarUrl,
                coverUrl: formData.coverUrl,
                tagline: formData.tagline,
                bio: formData.bio,
                locations: locationsArray,
                languages: languagesArray,
                services: formData.services
            });

            setMessage({ text: "Profile updated successfully!", type: "success" });
            window.scrollTo({ top: 0, behavior: "smooth" });
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);

            // Force reload auth ui
            window.location.reload();

        } catch (error: any) {
            console.error("Error updating profile:", error);
            setMessage({ text: error.message || "Failed to update profile", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || isLoadingData || !user || dbUser?.role !== "guide") {
        return (
            <div className="flex justify-center p-24">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/guide">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
                    <p className="text-slate-500">Edit the public information travelers see on your guide page.</p>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium mb-6 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-8">

                {/* Visuals Card */}
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Profile Images</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            <Label>Avatar Photo</Label>
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-24 rounded-full bg-slate-100 overflow-hidden relative border-2 border-slate-200 shrink-0">
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 bg-teal-50">
                                            <User className="h-10 w-10 text-teal-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.avatarUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                                        className="bg-slate-50 rounded-xl"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">Provide an image URL.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Label>Cover Photo</Label>
                            <div className="flex items-center gap-6">
                                <div className="h-24 w-32 rounded-xl bg-slate-100 overflow-hidden relative border-2 border-slate-200 shrink-0">
                                    {formData.coverUrl ? (
                                        <img src={formData.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                                            <ImageIcon className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <Input
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.coverUrl}
                                        onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                                        className="bg-slate-50 rounded-xl"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">High resolution banner image.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Info Card */}
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm">
                    <h2 className="text-xl font-bold mb-6">Basic Information</h2>

                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-700">Display Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="h-12 bg-slate-50 rounded-xl"
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="tagline" className="text-slate-700">Tagline</Label>
                            <Input
                                id="tagline"
                                value={formData.tagline}
                                onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                                className="h-12 bg-slate-50 rounded-xl"
                                placeholder="e.g. Uncovering the hidden stories of Sylhet."
                            />
                            <p className="text-xs text-slate-500">A short, catchy sentence displayed under your name.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="bio" className="text-slate-700">Biography</Label>
                            <Textarea
                                id="bio"
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                className="min-h-[120px] bg-slate-50 rounded-xl resize-none"
                                placeholder="Tell travelers about yourself, your experience, and why they should book you..."
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="locations" className="text-slate-700">Service Locations</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="locations"
                                        value={formData.locations}
                                        onChange={(e) => setFormData(prev => ({ ...prev, locations: e.target.value }))}
                                        className="pl-10 h-12 bg-slate-50 rounded-xl"
                                        placeholder="Sylhet, Sreemangal"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Comma separated places you operate in.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="languages" className="text-slate-700">Spoken Languages</Label>
                                <div className="relative">
                                    <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        id="languages"
                                        value={formData.languages}
                                        onChange={(e) => setFormData(prev => ({ ...prev, languages: e.target.value }))}
                                        className="pl-10 h-12 bg-slate-50 rounded-xl"
                                        placeholder="English, Bangla, Sylheti"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">Comma separated languages you fluently speak.</p>
                            </div>
                        </div>

                    </div>
                </Card>

                {/* Services Card */}
                <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold">Services & Pricing</h2>
                            <p className="text-sm text-slate-500">Add the tours and services travelers can book.</p>
                        </div>
                        <Button type="button" variant="outline" onClick={addService} className="rounded-xl flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Service
                        </Button>
                    </div>

                    {formData.services.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500">You haven't added any services yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {formData.services.map((service, index) => (
                                <div key={service.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 relative group">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeService(index)}
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid md:grid-cols-2 gap-4 mt-2">
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Title</Label>
                                            <Input
                                                value={service.title}
                                                onChange={(e) => updateService(index, 'title', e.target.value)}
                                                className="bg-white border-none rounded-xl"
                                                placeholder="e.g. Full Day Tour"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</Label>
                                            <select
                                                value={service.category}
                                                onChange={(e) => updateService(index, 'category', e.target.value)}
                                                className="flex h-10 w-full rounded-xl border-none bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                                            >
                                                <option value="guided_tour">Guided Tour</option>
                                                <option value="photography">Photography</option>
                                                <option value="hotel_booking">Hotel Booking</option>
                                                <option value="transportation">Transportation</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Price (BDT)</Label>
                                            <Input
                                                type="number"
                                                value={service.price}
                                                onChange={(e) => updateService(index, 'price', Number(e.target.value))}
                                                className="bg-white border-none rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pricing Style</Label>
                                            <select
                                                value={service.priceType}
                                                onChange={(e) => updateService(index, 'priceType', e.target.value)}
                                                className="flex h-10 w-full rounded-xl border-none bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                                            >
                                                <option value="per_day">Per Day</option>
                                                <option value="per_person">Per Person</option>
                                                <option value="fixed">Fixed Single Price</option>
                                            </select>
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
                                            <Textarea
                                                value={service.description}
                                                onChange={(e) => updateService(index, 'description', e.target.value)}
                                                className="bg-white border-none rounded-xl resize-none h-20"
                                                placeholder="What's included in this service?"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3 sticky bottom-4 z-10 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg">
                    <Link href="/dashboard/guide">
                        <Button type="button" variant="outline" className="h-12 px-6 rounded-xl">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={isSaving || !formData.name.trim()}
                        className="h-12 px-8 min-w-[150px] rounded-xl bg-teal-600 hover:bg-teal-700 font-bold"
                    >
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Profile"}
                    </Button>
                </div>

            </form>
        </div>
    );
}
