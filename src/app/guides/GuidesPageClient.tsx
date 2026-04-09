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
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-[#067c18] animate-spin mb-3" />
                <p className="text-gray-400 font-medium text-sm">Loading guides...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 mt-4">
                <Compass className="h-12 w-12 text-red-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>Something went wrong</h3>
                <p className="text-gray-400">{error}</p>
            </div>
        );
    }

    if (guides.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 mt-4">
                <Compass className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>No guides available</h3>
                <p className="text-gray-400">We couldn&apos;t find any verified guides right now. Check back soon!</p>
            </div>
        );
    }

    return <GuideSearchClient initialGuides={guides} />;
}
