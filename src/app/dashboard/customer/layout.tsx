"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Compass, MapPin, Heart, MessageSquare, Bell, Settings, Calendar } from "lucide-react";

const customerLinks = [
    { title: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
    { title: "Explore Guides", href: "/dashboard/customer/explore", icon: Compass },
    { title: "My Trips", href: "/dashboard/customer/trips", icon: Calendar },
    { title: "Wishlist", href: "/dashboard/customer/wishlist", icon: Heart },
    { title: "Messages", href: "/dashboard/customer/messages", icon: MessageSquare },
    { title: "Notifications", href: "/dashboard/customer/notifications", icon: Bell },
    { title: "Settings", href: "/dashboard/customer/profile", icon: Settings },
];

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            } else if (dbUser && dbUser.role !== "customer" && dbUser.role !== "admin") {
                // Allow admin to view customer dashboard, otherwise redirect
                router.push(`/dashboard/${dbUser.role}`);
            }
        }
    }, [user, dbUser, loading, router]);

    if (loading || !user) {
        return <div className="min-h-screen flex items-center justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    return (
        <DashboardLayout links={customerLinks} title="My Dashboard">
            {children}
        </DashboardLayout>
    );
}

import { Loader2 } from "lucide-react";
