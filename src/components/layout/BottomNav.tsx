"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { href: "/", label: "Explore", icon: Home },
    { href: "/guides", label: "Search", icon: Search },
    { href: "/dashboard/customer", label: "Bookings", icon: Calendar },
    { href: "/dashboard/customer/profile", label: "Profile", icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 z-50 w-full md:hidden h-16 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
            <div className="grid h-full w-full grid-cols-4">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "inline-flex flex-col items-center justify-center gap-1 transition-colors",
                                isActive ? "text-[#067c18]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                            <span className={cn("text-[10px] font-semibold", isActive ? "text-[#067c18]" : "text-gray-400")}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
