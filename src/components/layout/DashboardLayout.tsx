"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

    const SidebarContent = () => (
        <div className="flex h-full flex-col gap-4 py-4">
            <div className="px-6 pb-4">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
            </div>
            <nav className="flex-1 space-y-1 px-4">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "opacity-100" : "opacity-70")} />
                            {link.title}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className="flex min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4rem)] w-full flex-col bg-slate-50/50 dark:bg-slate-950">
            {/* Mobile Header */}
            <div className="flex lg:hidden items-center justify-between border-b bg-white dark:bg-slate-950 px-4 py-3 sticky top-16 z-30">
                <h1 className="text-lg font-bold">{title}</h1>
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="lg:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 p-0">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            <div className="container mx-auto flex-1 flex py-6 lg:py-8 px-4 sm:px-6">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900/50 border rounded-2xl shadow-sm mr-8 h-fit sticky top-24 z-10 backdrop-blur-xl">
                    <SidebarContent />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 max-w-full">
                    <div className="bg-white dark:bg-slate-900/40 border dark:border-slate-800/50 rounded-2xl shadow-sm backdrop-blur-xl p-4 sm:p-6 lg:p-8 min-h-[500px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
