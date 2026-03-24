"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, CalendarCheck, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";

export default function CustomerNotificationsPage() {
    const { user, loading } = useAuth();
    const { orders, loading: ordersLoading } = useOrders('customer');

    if (loading || !user) return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

    // Generate notifications from real order data
    const notifications = orders.slice(0, 10).map(order => ({
        id: order.id,
        icon: order.status === 'confirmed'
            ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            : order.status === 'pending'
            ? <AlertCircle className="h-5 w-5 text-amber-500" />
            : <CalendarCheck className="h-5 w-5 text-blue-500" />,
        title: order.status === 'confirmed' ? 'Booking Confirmed!' :
               order.status === 'pending' ? 'Awaiting Guide Confirmation' : `Trip ${order.status}`,
        description: `Your trip with ${order.guideName || 'your guide'} ${
            order.startDate?.toDate
                ? `on ${order.startDate.toDate().toLocaleDateString()}`
                : ''
        } — ৳${order.totalPrice?.toLocaleString()}`,
        time: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent',
    }));

    return (
        <div className="max-w-3xl space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Notifications</h1>
                    <p className="text-slate-500">Stay up to date on your bookings and trips.</p>
                </div>
                {notifications.length > 0 && (
                    <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-black">
                        {notifications.length}
                    </div>
                )}
            </div>

            {ordersLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
            ) : notifications.length === 0 ? (
                <Card className="p-16 text-center rounded-3xl border-dashed border-slate-200">
                    <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No notifications yet. Book a trip to get started!</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notif => (
                        <div key={notif.id} className="flex gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-shadow">
                            <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                {notif.icon}
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-white text-sm">{notif.title}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{notif.description}</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">{notif.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
