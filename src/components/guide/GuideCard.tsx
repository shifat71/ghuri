"use client";

import Link from "next/link";
import { Heart, Star, MapPin } from "lucide-react";

export interface GuideCardProps {
    id: string;
    name: string;
    avatarUrl: string;
    coverUrl?: string;
    rating: number;
    reviews: number;
    nogoriStatus?: string;
    pricePerDay: number;
    locations: string[];
    bio?: string;
    services?: { title: string; [key: string]: unknown }[];
}

export function GuideCard({
    id, name, avatarUrl, coverUrl, rating, reviews, nogoriStatus, pricePerDay, locations,
}: GuideCardProps) {
    const isVerified = nogoriStatus === "verified" || nogoriStatus === "pro";

    return (
        <Link href={`/guides/${id}`} className="block group">
            <div className="aspect-[4/5] relative overflow-hidden rounded-3xl bg-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)]">

                {/* Wishlist */}
                <button
                    className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-white transition-all shadow-sm"
                    onClick={(e) => e.preventDefault()}
                    aria-label="Add to Wishlist"
                >
                    <Heart className="h-4 w-4" />
                </button>

                {/* Cover */}
                {(coverUrl || avatarUrl) ? (
                    <img
                        src={coverUrl ?? avatarUrl}
                        alt={`Guide ${name}`}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Verified badge */}
                {isVerified && (
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#067c18] text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">
                        🛡️ {nogoriStatus === "pro" ? "Pro Guide" : "Verified"}
                    </div>
                )}

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                    <div className="flex items-end justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="font-bold text-white text-base leading-tight truncate" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                                {name}
                            </h3>
                            {locations?.[0] && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <MapPin className="h-3 w-3 text-white/60 shrink-0" />
                                    <span className="text-xs text-white/70 truncate">{locations[0]}</span>
                                </div>
                            )}
                        </div>
                        {rating > 0 && (
                            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full shrink-0">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span className="text-white text-xs font-semibold">{rating.toFixed(1)}</span>
                                {reviews > 0 && <span className="text-white/60 text-[10px]">({reviews})</span>}
                            </div>
                        )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-white/80 text-sm">
                            From <span className="text-white font-bold">৳{pricePerDay.toLocaleString()}</span>/day
                        </p>
                        <span className="text-[10px] text-white/50 font-medium uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
                            View Profile →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
