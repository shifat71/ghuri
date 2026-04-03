"use client";

import { useEffect, useState } from "react";

const IMAGES = [
    "/Tangua.jpg",
    "/Sundarbans.jpg",
    "/Saint.jpg",
    "/rand.jpg",
    "/farm.jpg",
    "/beach.jpg",
];

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev] = useState<number | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setPrev(current);
            setCurrent((c) => (c + 1) % IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [current]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Previous image (fading out) */}
            {prev !== null && (
                <img
                    key={`prev-${prev}`}
                    src={IMAGES[prev]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-0 animate-fadeOut"
                    aria-hidden="true"
                />
            )}
            {/* Current image (fading in) */}
            <img
                key={`curr-${current}`}
                src={IMAGES[current]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover animate-fadeIn"
                aria-hidden="true"
            />
            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

            {/* Dot indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {IMAGES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => { setPrev(current); setCurrent(i); }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
