"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout, NavLink } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, User, Wallet, CalendarRange, Map, Star, Bell, Box, ShieldAlert } from "lucide-react";

export const guideLinks: NavLink[] = [
    { title: "Overview", href: "/dashboard/guide", icon: LayoutDashboard },
    { title: "Profile", href: "/dashboard/guide/profile", icon: User },
    { title: "Services & Pricing", href: "/dashboard/guide/services", icon: Wallet },
    { title: "Availability & Location", href: "/dashboard/guide/calendar", icon: Map },
    { title: "Bookings", href: "/dashboard/guide/bookings", icon: CalendarRange },
    { title: "Earnings", href: "/dashboard/guide/earnings", icon: Wallet },
    { title: "Tour Packages", href: "/dashboard/guide/packages", icon: Box },
    { title: "Reviews", href: "/dashboard/guide/reviews", icon: Star },
];

export default function GuideDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            } else if (dbUser && dbUser.role !== "guide") {
                router.push(`/dashboard/${dbUser.role}`);
            }
        }
    }, [user, dbUser, loading, router]);

    if (loading || !user || dbUser?.role !== "guide") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <DashboardLayout title="Guide Dashboard" links={guideLinks}>
            {children}
        </DashboardLayout>
    );
}
