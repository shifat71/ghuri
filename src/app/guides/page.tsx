import { Compass } from "lucide-react";
import { GuidesPageClient } from "./GuidesPageClient";

export const dynamic = 'force-dynamic';

export default function GuidesPage() {
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
                <GuidesPageClient />
            </div>
        </div>
    );
}
