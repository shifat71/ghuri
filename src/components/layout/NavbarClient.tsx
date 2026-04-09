"use client";

import Link from "next/link";
import { Search, Bell, Menu, UserCircle, LogOut, LayoutDashboard, AlertCircle, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NavbarClient() {
    const { user, dbUser, logout } = useAuth();
    const t = useTranslations("Navbar");
    const router = useRouter();
    const pathname = usePathname();
    const [currentLang, setCurrentLang] = useState("bn");
    const [scrolled, setScrolled] = useState(false);

    const isHome = pathname === '/';
    const isTransparent = isHome && !scrolled;

    useEffect(() => {
        const isEn = document.cookie.includes('NEXT_LOCALE=en');
        setCurrentLang(isEn ? 'EN' : 'BN');
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener('scroll', onScroll, { passive: true });
        // Initial check
        setScrolled(window.scrollY > 24);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const toggleLanguage = () => {
        const isEn = document.cookie.includes('NEXT_LOCALE=en');
        const newLang = isEn ? 'bn' : 'en';
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
        setCurrentLang(newLang.toUpperCase());
        router.refresh();
    };

    const dashboardLink = dbUser?.role ? `/dashboard/${dbUser.role}` : '/onboarding';

    // Dynamic styling classes
    const navBackgroundClass = isTransparent 
        ? "bg-transparent border-transparent" 
        : "glass-nav shadow-md border-white/20";
        
    const textColorClass = isTransparent ? "text-white hover:text-white/80" : "text-gray-600 hover:text-primary";
    const logoColorClass = isTransparent ? "text-white" : "text-primary";
    const btnBgClass = isTransparent ? "bg-white/10 hover:bg-white/20 text-white" : "bg-primary/10 hover:bg-primary/20 text-primary";
    const iconColorClass = isTransparent ? "text-white/80 hover:text-white hover:bg-white/10" : "text-gray-500 hover:text-primary hover:bg-primary/10";

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-5 px-4 pointer-events-none">
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`pointer-events-auto w-full max-w-5xl flex items-center justify-between px-6 py-2.5 rounded-full transition-all duration-500 ease-in-out ${navBackgroundClass}`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <img src="/image-Photoroom.png" alt="Ghuri Logo" className="h-8 w-auto object-contain" />
                    <span
                        className={`text-xl font-extrabold tracking-tight transition-colors duration-500 ${logoColorClass}`}
                        style={{ fontFamily: 'var(--font-headline, "Plus Jakarta Sans", sans-serif)' }}
                    >
                        Ghuri
                    </span>
                </Link>

                {/* Center nav — desktop */}
                <nav className="hidden md:flex items-center gap-2">
                    {[
                        { href: "/destinations", label: t('destinations') },
                        { href: "/guides", label: t('findGuide') },
                        { href: "/how-it-works", label: t('howItWorks') },
                    ].map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative group px-4 py-1.5 rounded-full text-[0.8125rem] font-semibold transition-all duration-300 ${textColorClass}`}
                        >
                            <span className="relative z-10">{item.label}</span>
                            {/* Circular moving border animation */}
                            <div 
                                className="absolute inset-0 rounded-full z-0 p-[1.5px] transition-opacity duration-300 overflow-hidden pointer-events-none"
                                style={{
                                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "xor",
                                    maskComposite: "exclude"
                                }}
                            >
                                <div className="absolute top-1/2 left-1/2 w-[300%] h-[300%] -translate-x-1/2 -translate-y-1/2 animate-[spin_2s_linear_infinite] group-hover:[animation-play-state:paused] bg-[conic-gradient(from_0deg,transparent_0_70%,#E6E6FA_100%)]" />
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleLanguage}
                        className={`rounded-full text-[0.75rem] font-bold px-3 h-8 transition-colors duration-500 ${btnBgClass}`}
                    >
                        <Languages className="h-3.5 w-3.5 mr-1" />
                        {currentLang}
                    </Button>

                    <Button variant="ghost" size="icon" className={`hidden sm:flex h-8 w-8 rounded-full transition-colors duration-500 ${iconColorClass}`} aria-label="Search">
                        <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-full transition-colors duration-500 ${iconColorClass}`} aria-label="Notifications">
                        <Bell className="h-4 w-4" />
                    </Button>

                    <div className={`hidden sm:block h-5 w-px mx-1 transition-colors duration-500 ${isTransparent ? 'bg-white/20' : 'bg-gray-200'}`} />

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className={`rounded-full overflow-hidden border-2 h-8 w-8 relative transition-colors duration-500 ${isTransparent ? 'border-white/30' : 'border-primary/20'}`}>
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" width={32} height={32} className="object-cover rounded-full" />
                                    ) : (
                                        <UserCircle className={`h-5 w-5 ${isTransparent ? 'text-white' : 'text-gray-500'}`} />
                                    )}
                                    {!dbUser?.role && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl mt-2 shadow-lg border border-gray-100 backdrop-blur-xl bg-white/95">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-semibold leading-none text-gray-900">{dbUser?.displayName || user.displayName || 'Traveler'}</p>
                                        <p className="text-xs leading-none text-gray-500">{user.email}</p>
                                        {!dbUser?.role && (
                                            <p className="text-xs font-semibold text-red-500 mt-1">Profile incomplete</p>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-gray-50">
                                    <Link href={dashboardLink} className="w-full flex items-center">
                                        {!dbUser?.role ? (
                                            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                        ) : (
                                            <LayoutDashboard className="mr-2 h-4 w-4 text-primary" />
                                        )}
                                        <span className={!dbUser?.role ? "text-red-500 font-medium" : ""}>
                                            {!dbUser?.role ? t('completeSetup') : t('dashboard')}
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 rounded-xl transition-colors" onClick={() => logout()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t('logout')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <AuthModal
                                defaultTab="signin"
                                trigger={
                                    <Button variant="ghost" className={`rounded-full font-semibold px-4 h-8 text-[0.8125rem] hidden sm:flex transition-colors duration-500 ${isTransparent ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:text-primary hover:bg-primary/10'}`}>
                                        {t('login')}
                                    </Button>
                                }
                            />
                            <AuthModal
                                defaultTab="signup"
                                trigger={
                                    <Button className={`rounded-full font-semibold px-5 h-8 text-[0.8125rem] hidden sm:flex shadow-sm transition-all duration-500 ${isTransparent ? 'bg-white text-black hover:bg-gray-100 opacity-90 hover:opacity-100' : 'bg-primary text-white hover:bg-[#055f12]'}`}>
                                        {t('signup')}
                                    </Button>
                                }
                            />
                        </div>
                    )}

                    <Button variant="ghost" size="icon" className={`md:hidden h-8 w-8 rounded-full ${iconColorClass}`}>
                        <Menu className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </motion.nav>
        </header>
    );
}
