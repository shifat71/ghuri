"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export interface NavLink {
    title: string;
    href: string;
    icon: React.ElementType;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    links: NavLink[];
    title: string;
}

export function DashboardLayout({ children, links, title }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, dbUser, logout } = useAuth();

    const displayName = dbUser?.displayName || user?.displayName || "User";
    const avatarUrl = dbUser?.photoURL || user?.photoURL || null;
    const role = dbUser?.role || "user";
    const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

    const roleLabel: Record<string, string> = {
        guide: "Guide",
        customer: "Traveler",
        admin: "Admin",
    };

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Brand + Role */}
            <div className="px-5 pt-6 pb-5 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2 mb-4">
                    <span className="text-xl font-extrabold tracking-tight text-[#067c18]"
                        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                        Ghuri
                    </span>
                </Link>
                <div className="flex items-center gap-3">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-9 w-9 rounded-full object-cover border-2 border-gray-100"
                        />
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-[#067c18]/10 flex items-center justify-center text-[#067c18] font-bold text-sm shrink-0">
                            {initials}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#067c18]/10 text-[#067c18]">
                            {roleLabel[role] ?? role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                                isActive
                                    ? "bg-[#067c18] text-white shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600")} />
                            <span className="flex-1">{link.title}</span>
                            {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pb-5 pt-3 border-t border-gray-100">
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-[calc(100vh-5rem)] w-full bg-[#f4f4f4]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-56 xl:w-64 flex-col bg-white border-r border-gray-100 fixed top-[5rem] bottom-0 left-0 z-20 overflow-y-auto">
                <SidebarContent />
            </aside>

            {/* Main area */}
            <div className="flex-1 lg:ml-56 xl:ml-64 flex flex-col min-h-full">
                {/* Mobile top bar */}
                <div className="flex lg:hidden items-center justify-between bg-white border-b border-gray-100 px-4 py-3 sticky top-[4rem] z-10">
                    <h1
                        className="text-base font-bold text-gray-900"
                        style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
                    >
                        {title}
                    </h1>
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-500">
                                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-0 bg-white">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
