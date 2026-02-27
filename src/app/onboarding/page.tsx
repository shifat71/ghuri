"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map, Camera } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function OnboardingPage() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if they already have a role or aren't logged in
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            } else if (dbUser?.role) {
                router.push(`/dashboard/${dbUser.role}`);
            }
        }
    }, [user, dbUser, loading, router]);

    const handleSelectRole = async (role: "customer" | "guide") => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            // Create their base user document
            await setDoc(doc(db, "users", user.uid), {
                role,
                displayName: user.displayName || "User",
                email: user.email,
                photoURL: user.photoURL || null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // If they are a guide, also create a skeleton guide profile document
            if (role === "guide") {
                await setDoc(doc(db, "guides", user.uid), {
                    userId: user.uid,
                    bio: "",
                    tagline: "",
                    locations: [],
                    languages: [],
                    nogoriStatus: "pending",
                    manualScreeningPassed: false,
                    rating: 0,
                    totalReviews: 0,
                    totalTrips: 0,
                    isActive: false,
                    coverPhotoURL: "",
                });
            }

            // Force a hard reload to securely update AuthContext state
            window.location.href = `/dashboard/${role}`;
        } catch (error) {
            console.error("Error setting role:", error);
            setIsSubmitting(false);
        }
    };

    if (loading || isSubmitting || dbUser?.role) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-slate-500">Setting up your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-20 px-4 bg-slate-50 dark:bg-slate-900">
            <div className="max-w-3xl w-full text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
                    Welcome to <span className="text-teal-600 dark:text-teal-400">Ghuri</span>
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Before we continue, please tell us how you plan to use the platform so we can personalize your experience.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">

                {/* Customer Choice */}
                <Card className="p-8 border-2 border-transparent hover:border-teal-500 transition-all cursor-pointer group bg-white dark:bg-slate-800 rounded-3xl" onClick={() => handleSelectRole("customer")}>
                    <div className="h-20 w-20 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Map className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">I want to Explore</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        I'm a traveler looking to find and book amazing Nogori Verified local guides for my next trip.
                    </p>
                    <Button className="w-full rounded-xl" size="lg">Continue as Traveler</Button>
                </Card>

                {/* Guide Choice */}
                <Card className="p-8 border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer group bg-white dark:bg-slate-800 rounded-3xl" onClick={() => handleSelectRole("guide")}>
                    <div className="h-20 w-20 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Camera className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">I want to Guide</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        I'm a local expert, photographer, or planner looking to offer my travel services and earn money.
                    </p>
                    <Button className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white" size="lg">Apply as Guide</Button>
                </Card>

            </div>
        </div>
    );
}
