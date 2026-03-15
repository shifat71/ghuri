"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import Link from "next/link";


const CAROUSEL_IMAGES = [
  '/TeaGarden.jpg',
  '/Sundarbans.jpg',
  '/beach.jpg',
  '/Saint.jpg',
  '/Tangua.jpg',
  '/farm.jpg',
  '/rand.jpg',
];



function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation states
  const [loaded, setLoaded] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showDivider, setShowDivider] = useState(false);
  const [showExplore, setShowExplore] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Sequence delays
    const t1 = setTimeout(() => setLoaded(true), 300);
    const t2 = setTimeout(() => setShowTagline(true), 900);
    const t3 = setTimeout(() => setShowDivider(true), 1400);
    const t4 = setTimeout(() => setShowExplore(true), 1700);
    const t5 = setTimeout(() => setShowAuth(true), 2000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5);
    };
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % CAROUSEL_IMAGES.length), []);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {CAROUSEL_IMAGES.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
            zIndex: i === current ? 1 : 0,
            backgroundColor: "#3B4A2F",
          }}
        >
          <img
            src={src}
            alt=""
            className="w-screen h-screen object-cover absolute inset-0"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>
      ))}


      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">

        <Link href="/how-it-works" className="mb-5 cursor-pointer">
          <p
            className="flex text-6xl md:text-8xl font-black tracking-widest"
            style={{
              color: "#ffffff",
              perspective: "1000px"
            }}
          >

            {"Ghuri".split("").map((char, index) => (
              <span
                key={index}
                style={{
                  display: "inline-block",
                  opacity: loaded ? 1 : 0,
                  transform: loaded 
                    ? 'translateY(0) scale(1) rotateX(0deg)' 
                    : 'translateY(60px) scale(0.5) rotateX(90deg)',
                  transition: `opacity 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${100 + index * 100}ms, transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${100 + index * 100}ms`,
                }}
              >
                {char}
              </span>
            ))}
          </p>
        </Link>


        <h1
          className="text-4xl md:text-6xl font-bold text-white text-center leading-tight max-w-[700px]"
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: "0 2px 20px rgba(0,0,0,0.4)",
          }}
        >
          {"Travel Bangladesh with Nogori Verified Locals.".split(" ").map((word, index) => (
            <span
              key={index}
              style={{
                display: "inline-block",
                marginRight: "0.25em",
                opacity: showTagline ? 1 : 0,
                transform: showTagline ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.9s ease ${900 + index * 100}ms, transform 0.9s ease ${900 + index * 100}ms`,
              }}
            >
              {word}
            </span>
          ))}
        </h1>


        <div
          className="my-6 rounded-full"
          style={{
            width: showDivider ? "80px" : "0px",
            height: "2px",
            backgroundColor: "#6B7C3F",
            transition: "width 0.8s ease",
          }}
        />


        <Link href="/destinations" passHref>
          <button
            className="border-2 border-white text-white rounded-full px-8 py-3 font-medium text-sm md:text-base transition-all duration-300 hover:bg-[#6B7C3F] hover:border-[#6B7C3F] cursor-pointer"
            style={{
              letterSpacing: "0.05em",
              opacity: showExplore ? 1 : 0,
              transform: showExplore ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
              transition: 'opacity 0.7s ease, transform 0.7s ease, background-color 0.3s, border-color 0.3s',
            }}
          >
            Explore
          </button>
        </Link>

        {/* Auth buttons */}
        <div
          className="flex items-center gap-4 mt-8"
          style={{
            opacity: showAuth ? 1 : 0,
            transform: showAuth ? 'translateY(0)' : 'translateY(15px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <AuthModal
            defaultTab="signin"
            trigger={
              <button
                className="border-2 border-white text-white rounded-full px-6 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 cursor-pointer"
              >
                Log In
              </button>
            }
          />
          <AuthModal
            defaultTab="signup"
            trigger={
              <button
                className="rounded-full px-6 py-2 text-sm font-medium text-white transition-all duration-300 hover:opacity-90 cursor-pointer border-2 border-transparent"
                style={{ backgroundColor: "#6B7C3F" }}
              >
                Sign Up
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      {/* Hide navbar on landing page only */}
      <style>{`
                nav, header { display: none !important; }
            `}</style>

      <HeroCarousel />
    </>
  );
}
