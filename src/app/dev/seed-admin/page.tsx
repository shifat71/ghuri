"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function SeedAdminPage() {
    const { user, dbUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleMakeAdmin = async () => {
        if (!user) {
            setMessage("You must be logged in first.");
            return;
        }

        setLoading(true);
        try {
            // Update the user's role to 'admin' in Firestore
            await setDoc(doc(db, "users", user.uid), {
                role: "admin",
                displayName: user.displayName || "Admin User",
                email: user.email,
                photoURL: user.photoURL || "",
                updatedAt: new Date()
            }, { merge: true });

            setMessage("Success! You are now an Admin. Please refresh the page or restart the app to see changes.");
        } catch (error: any) {
            console.error("Error making admin:", error);
            setMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };

    const handleMakeGuide = async () => {
        if (!user) {
            setMessage("You must be logged in first.");
            return;
        }

        setLoading(true);
        try {
            // Update the user's role to 'guide' in users collection
            await setDoc(doc(db, "users", user.uid), {
                role: "guide",
                displayName: user.displayName || "Guide User",
                email: user.email,
                updatedAt: new Date()
            }, { merge: true });

            // Also create a basic guide profile in the 'guides' collection
            await setDoc(doc(db, "guides", user.uid), {
                name: user.displayName || "Guide User",
                email: user.email,
                nogoriStatus: "verified", // auto-verify for testing
                isActive: true, // Show in explore
                avatarUrl: user.photoURL || "",
                createdAt: new Date()
            }, { merge: true });

            setMessage("Success! You are now a verified Guide. Please refresh the page.");
        } catch (error: any) {
            console.error("Error making guide:", error);
            setMessage(`Error: ${error.message}`);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-md w-full p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center space-y-6">
                <h1 className="text-2xl font-bold">Role Seeder (Dev Only)</h1>
                
                {!user ? (
                    <p className="text-amber-600 font-medium bg-amber-50 p-4 rounded-xl">
                        Please log in to the app first, then return to this page.
                    </p>
                ) : (
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm">
                            <p><strong>Current User:</strong> {user.email}</p>
                            <p><strong>Current Role:</strong> {dbUser?.role || 'Unknown'}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleMakeAdmin}
                                disabled={loading}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Elevate to Admin"}
                            </button>

                            <button 
                                onClick={handleMakeGuide}
                                disabled={loading}
                                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                            >
                                {loading ? "Updating..." : "Elevate to Verified Guide"}
                            </button>

                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const { getDocs, collection, updateDoc, doc } = await import("firebase/firestore");
                                        const snap = await getDocs(collection(db, "guides"));
                                        let count = 0;
                                        for (const d of snap.docs) {
                                            const data = d.data();
                                            if (data.nogoriStatus === 'verified' || data.nogoriStatus === 'pro') {
                                                await updateDoc(doc(db, "guides", d.id), { isActive: true });
                                                count++;
                                            }
                                        }
                                        setMessage(`Repaired ${count} guides. They should now show up in Explore.`);
                                    } catch (err: any) {
                                        setMessage(`Error: ${err.message}`);
                                    }
                                    setLoading(false);
                                }}
                                disabled={loading}
                                className="w-full py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                {loading ? "..." : "Fix Existing Guides (Visibility)"}
                            </button>

                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const { seedAcceptedDomains } = await import("@/lib/verification");
                                        await seedAcceptedDomains();
                                        setMessage("Accepted edu domains seeded in Firestore (settings/accepted_edu_domains). You can manage them from the Admin panel.");
                                    } catch (err: any) {
                                        setMessage(`Error: ${err.message}`);
                                    }
                                    setLoading(false);
                                }}
                                disabled={loading}
                                className="w-full py-3 border-2 border-amber-200 dark:border-amber-700 text-amber-600 dark:text-amber-400 font-bold rounded-xl hover:bg-amber-50 transition-colors disabled:opacity-50"
                            >
                                {loading ? "..." : "Seed Accepted Edu Domains"}
                            </button>
                        </div>

                        {message && (
                            <p className="mt-4 p-4 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {message}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
