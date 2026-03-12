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
import { Loader2, ArrowLeft, User, Phone, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function CustomerProfileSettings() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Auth Guard & Pre-fill
    useEffect(() => {
        if (!loading) {
            if (!user) router.push("/");
            else if (dbUser && dbUser.role !== "customer") router.push(`/dashboard/${dbUser.role}`);
            else if (dbUser) {
                setName(dbUser.displayName || user.displayName || "");
                setPhone(dbUser.phoneNumber || "");
                setPhotoUrl(dbUser.photoURL || user.photoURL || "");
            }
        }
    }, [user, dbUser, loading, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage({ text: "", type: "" });

        try {
            // Update Auth Profile
            await updateProfile(user, {
                displayName: name,
                photoURL: photoUrl
            });

            // Update Firestore Profile
            await updateDoc(doc(db, "users", user.uid), {
                displayName: name,
                phoneNumber: phone,
                photoURL: photoUrl
            });

            setMessage({ text: "Profile updated successfully!", type: "success" });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ text: "", type: "" }), 3000);

            // Force reload to update AuthContext UI everywhere
            window.location.reload();

        } catch (error: any) {
            console.error("Error updating profile:", error);
            setMessage({ text: error.message || "Failed to update profile", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !user || dbUser?.role !== "customer") return null;

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/customer">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
                    <p className="text-slate-500">Manage your personal information.</p>
                </div>
            </div>

            <Card className="p-6 md:p-8 rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm">

                {/* Current Avatar Preview */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-24 w-24 rounded-full bg-slate-100 overflow-hidden relative mb-4 border-2 border-slate-200">
                        {photoUrl ? (
                            <img src={photoUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-teal-50 text-teal-600">
                                <User className="h-10 w-10" />
                            </div>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSave} className="flex flex-col gap-6">

                    {message.text && (
                        <div className={`p-4 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="name" className="text-slate-700">Display Name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="pl-10 h-12 bg-slate-50 rounded-xl"
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone" className="text-slate-700">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="pl-10 h-12 bg-slate-50 rounded-xl"
                                placeholder="+880 1..."
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="photo" className="text-slate-700">Profile Picture URL</Label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                id="photo"
                                type="url"
                                value={photoUrl}
                                onChange={(e) => setPhotoUrl(e.target.value)}
                                className="pl-10 h-12 bg-slate-50 rounded-xl"
                                placeholder="https://..."
                            />
                        </div>
                        <p className="text-xs text-slate-500">Leave blank to use an auto-generated avatar.</p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                        <Button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="w-full md:w-auto min-w-[140px] h-12 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold"
                        >
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Save Changes"}
                        </Button>
                    </div>

                </form>
            </Card>
        </div>
    );
}
