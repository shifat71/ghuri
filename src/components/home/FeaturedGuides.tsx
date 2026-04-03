"use client";

import { useEffect, useState } from "react";
import { collection, query, limit, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { GuideCard, GuideCardProps } from "@/components/guide/GuideCard";

export function FeaturedGuides() {
    const [guides, setGuides] = useState<GuideCardProps[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeatured() {
            try {
                // get up to 4 guides that have some verified status
                const q = query(
                    collection(db, "guides"),
                    where("nogoriStatus", "in", ["verified", "pro"]),
                    limit(4)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GuideCardProps[];
                setGuides(data);
            } catch (error) {
                console.error("Failed to load featured guides", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[4/5] bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />)}
            </div>
        );
    }

    if (guides.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.map(g => (
                <GuideCard key={g.id} {...g} />
            ))}
        </div>
    );
}
