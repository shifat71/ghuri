"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout, NavLink } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Settings, Map, CalendarCheck, Wallet, ShieldAlert } from "lucide-react";

export const adminLinks: NavLink[] = [
    { title: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Guides", href: "/dashboard/admin/guides", icon: Users },
    { title: "Bookings", href: "/dashboard/admin/bookings", icon: CalendarCheck },
    { title: "Locations", href: "/dashboard/admin/locations", icon: Map },
    { title: "Settings & Pricing", href: "/dashboard/admin/settings", icon: Settings },
    { title: "Payouts", href: "/dashboard/admin/payouts", icon: Wallet },
    { title: "Reviews", href: "/dashboard/admin/reviews", icon: ShieldAlert },
];

export default function AdminDashboardLayout({
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
            } else if (dbUser && dbUser.role !== "admin") {
                router.push(`/dashboard/${dbUser.role}`);
            }
        }
    }, [user, dbUser, loading, router]);

    if (loading || !user || dbUser?.role !== "admin") {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <DashboardLayout title="Admin Dashboard" links={adminLinks}>
            {children}
        </DashboardLayout>
    );
}
