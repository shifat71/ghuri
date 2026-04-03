"use client";

import Link from "next/link";
import { Search, Bell, Menu, UserCircle, LogOut, LayoutDashboard, AlertCircle, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
    const [currentLang, setCurrentLang] = useState("bn");

    useEffect(() => {
        const isEn = document.cookie.includes('NEXT_LOCALE=en');
        setCurrentLang(isEn ? 'EN' : 'BN');
    }, []);

    const toggleLanguage = () => {
        const isEn = document.cookie.includes('NEXT_LOCALE=en');
        const newLang = isEn ? 'bn' : 'en';
        document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
        setCurrentLang(newLang.toUpperCase());
        router.refresh();
    };

    // Determine dashboard link
    const dashboardLink = dbUser?.role ? `/dashboard/${dbUser.role}` : '/onboarding';

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">

                {/* Left: Logo & Mobile Menu */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-2xl font-black text-primary tracking-tight">Ghuri</span>
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <nav className="hidden md:flex gap-6 text-sm font-medium">
                    <Link href="/destinations" className="transition-colors hover:text-primary">
                        {t('destinations')}
                    </Link>
                    <Link href="/guides" className="transition-colors hover:text-primary">
                        {t('findGuide')}
                    </Link>
                    <Link href="/how-it-works" className="transition-colors hover:text-primary text-muted-foreground">
                        {t('howItWorks')}
                    </Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="sm" onClick={toggleLanguage} className="rounded-full font-bold flex items-center gap-2 text-primary bg-primary/5 hover:bg-primary/10">
                        <Languages className="h-4 w-4" />
                        {currentLang}
                    </Button>

                    <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Search">
                        <Search className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Notifications">
                        <Bell className="h-5 w-5" />
                    </Button>
                    <div className="hidden sm:block h-6 w-px bg-border" />
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full overflow-hidden border relative">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="Avatar" width={32} height={32} className="object-cover rounded-full" />
                                    ) : (
                                        <UserCircle className="h-6 w-6 text-slate-600" />
                                    )}
                                    {!dbUser?.role && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl">
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{dbUser?.displayName || user.displayName || 'Traveler'}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        {!dbUser?.role && (
                                            <p className="text-xs font-semibold text-red-500 mt-1">Profile incomplete</p>
                                        )}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link href={dashboardLink} className="w-full flex items-center">
                                        {!dbUser?.role ? (
                                            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                        ) : (
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                        )}
                                        <span className={!dbUser?.role ? "text-red-500 font-medium" : ""}>
                                            {!dbUser?.role ? t('completeSetup') : t('dashboard')}
                                        </span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => logout()}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>{t('logout')}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <AuthModal
                                defaultTab="signin"
                                trigger={<Button variant="ghost" className="rounded-full font-medium px-4 hidden sm:flex">{t('login')}</Button>}
                            />
                            <AuthModal
                                defaultTab="signup"
                                trigger={<Button className="rounded-full font-medium px-6 hidden sm:flex">{t('signup')}</Button>}
                            />
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}
