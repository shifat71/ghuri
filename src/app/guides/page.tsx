import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { GuideCardProps } from "@/components/guide/GuideCard";
import { Compass } from "lucide-react";
import { GuideSearchClient } from "./GuideSearchClient";

export const dynamic = 'force-dynamic';

export default async function GuidesPage() {
    let guides: GuideCardProps[] = [];
    try {
        const querySnapshot = await getDocs(collection(db, "guides"));
        guides = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as GuideCardProps[];
    } catch (error) {
        console.error("Error fetching guides server-side:", error);
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">

            {/* Header Area */}
            <div className="bg-teal-900 dark:bg-slate-950 pt-20 pb-16 px-4 md:px-8 text-center">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                    Find Your <span className="text-emerald-400">Perfect Guide</span>
                </h1>
                <p className="text-teal-100 max-w-2xl mx-auto text-base md:text-lg">
                    Browse our curated list of Nogori Verified locals. From deep photography tours to standard city guiding, find the right expert for your trip.
                </p>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 -mt-8 relative z-10">
                {guides.length > 0 ? (
                    <GuideSearchClient initialGuides={guides} />
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-sm border border-slate-100 dark:border-slate-700 mt-8">
                        <Compass className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No guides available</h3>
                        <p className="text-slate-500">We couldn't find any verified guides in the database right now.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
