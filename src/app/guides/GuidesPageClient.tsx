"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { GuideCardProps } from "@/components/guide/GuideCard";
import { GuideSearchClient } from "./GuideSearchClient";
import { Compass, Loader2 } from "lucide-react";

export function GuidesPageClient() {
    const [guides, setGuides] = useState<GuideCardProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGuides() {
            try {
                const querySnapshot = await getDocs(collection(db, "guides"));
                const fetchedGuides = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as GuideCardProps[];
                setGuides(fetchedGuides);
            } catch (err) {
                console.error("Error fetching guides:", err);
                setError("Failed to load guides. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchGuides();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 mt-8">
                <Loader2 className="h-10 w-10 text-teal-500 animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Loading guides...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700 mt-8">
                <Compass className="h-12 w-12 text-red-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
                <p className="text-slate-500">{error}</p>
            </div>
        );
    }

    if (guides.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700 mt-8">
                <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No guides available</h3>
                <p className="text-slate-500">We couldn&apos;t find any verified guides in the database right now.</p>
            </div>
        );
    }

    return <GuideSearchClient initialGuides={guides} />;
}
