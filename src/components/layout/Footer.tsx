"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export function Footer() {
    const t = useTranslations("Landing");

    return (
        <footer className="relative w-full bg-[#111111] text-white pt-20 pb-10 overflow-hidden flex flex-col justify-end min-h-[500px] sm:min-h-[600px] z-0">
            {/* Top Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
                {/* Brand */}
                <div className="col-span-1 md:col-span-1 border-white/10">
                    <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-[#067c18] inline-block"></span>
                        GHURI
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                        Connecting you with verified, passionate locals for the ultimate authentic experience across Bangladesh.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="col-span-1">
                    <h4 className="font-semibold mb-4 text-white/90">Platform</h4>
                    <ul className="space-y-3 text-sm text-white/50">
                        <li><Link href="/destinations" className="hover:text-[#067c18] transition-colors">{t('destinations')}</Link></li>
                        <li><Link href="/guides" className="hover:text-[#067c18] transition-colors">{t('findGuide')}</Link></li>
                        <li><Link href="/how-it-works" className="hover:text-[#067c18] transition-colors">{t('howItWorks')}</Link></li>
                        <li><Link href="/onboarding" className="hover:text-[#067c18] transition-colors">Become a Guide</Link></li>
                    </ul>
                </div>

                {/* Legal & Social */}
                <div className="col-span-1">
                    <h4 className="font-semibold mb-4 text-white/90">Legal</h4>
                    <ul className="space-y-3 text-sm text-white/50">
                        <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="/support" className="hover:text-white transition-colors">Support Center</Link></li>
                    </ul>
                </div>
            </div>

            {/* Giant OUTLINE Typography Background */}
            <div className="absolute top-[20%] left-0 w-full overflow-hidden flex justify-center pointer-events-none select-none drop-shadow-2xl opacity-10">
                <motion.h1 
                    initial={{ y: 100, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[18vw] font-black leading-none tracking-tighter"
                    style={{
                        fontFamily: 'var(--font-headline, "Plus Jakarta Sans", sans-serif)',
                        WebkitTextStroke: "2px rgba(255, 255, 255, 0.4)",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    GHURI
                </motion.h1>
            </div>

            {/* Copyright */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/10 text-white/40 text-xs">
                <p>&copy; {new Date().getFullYear()} Ghuri Platform. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <span className="hover:text-white cursor-pointer transition-colors">Facebook</span>
                    <span className="hover:text-white cursor-pointer transition-colors">Instagram</span>
                    <span className="hover:text-white cursor-pointer transition-colors">LinkedIn</span>
                </div>
            </div>
        </footer>
    );
}
