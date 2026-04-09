import { GuidesPageClient } from "./GuidesPageClient";
import { Search } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function GuidesPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#fafafa]">

            {/* Premium Header */}
            <div className="relative pt-32 pb-16 px-4 md:px-8 text-center bg-white border-b border-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#067c18]/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#067c18]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white border border-[#067c18]/10 text-[#067c18] text-xs font-bold uppercase tracking-[0.15em] mb-4 shadow-sm">
                        Nogori Verified
                    </span>
                    <h1
                        className="text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-[1.1]"
                        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                    >
                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#067c18] to-[#8e63f0]">Perfect Guide</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Browse our curated list of Nogori Verified locals. From deep photography tours to standard city guiding, find the right expert for your trip.
                    </p>
                </div>
            </div>

            {/* Main Content Component */}
            <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 py-10 relative z-10">
                <GuidesPageClient />
            </div>
        </div>
    );
}
