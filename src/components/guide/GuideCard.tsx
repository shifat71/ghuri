"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
    services?: any[];
}

export function GuideCard({
    id,
    name,
    avatarUrl,
    coverUrl,
    rating,
    reviews,
    nogoriStatus,
    pricePerDay,
    locations,
}: GuideCardProps) {
    return (
        <Link href={`/guides/${id}`} className="block group">
            <Card className="aspect-[4/5] relative overflow-hidden rounded-3xl border-0 bg-slate-100 dark:bg-slate-800 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">

                {/* Wishlist Button */}
                <button
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement toggle wishlist
                    }}
                    aria-label="Add to Wishlist"
                >
                    <Heart className="h-5 w-5" />
                </button>

                {/* Profile Image / Video */}
                <Image
                    src={coverUrl || avatarUrl}
                    alt={`Profile of ${name}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Bottom Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">

                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white text-xl line-clamp-1">{name}</h3>
                        <div className="flex items-center gap-1 text-white bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm text-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{rating}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                        <p className="text-slate-200 text-sm font-medium">
                            From <span className="text-white">৳{pricePerDay}</span>/day
                        </p>
                        {(nogoriStatus === 'verified' || nogoriStatus === 'pro') && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold border-0">
                                <span className="mr-1">🛡️</span> {nogoriStatus === 'pro' ? 'Pro' : 'Verified'}
                            </Badge>
                        )}
                    </div>

                </div>
            </Card>
        </Link>
    );
}
