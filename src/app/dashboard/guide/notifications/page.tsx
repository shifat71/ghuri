"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Loader2, Bell, Sparkles, TrendingUp, CalendarDays, CheckCircle2, MessageSquare } from "lucide-react";

export default function GuideNotificationsPage() {
    const { user, dbUser, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mocking a fetch for notifications/suggestions
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (loading || isLoading || !user) {
        return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;
    }

    const suggestions = [
        {
            id: 1,
            type: 'insight',
            icon: <TrendingUp className="h-5 w-5 text-indigo-500" />,
            title: 'High Demand in Sylhet',
            description: 'Searches for Sylhet tours are up 45% this week. Consider opening up more availability!',
            time: '2 hours ago',
            action: 'Update Availability'
        },
        {
            id: 2,
            type: 'pricing',
            icon: <Sparkles className="h-5 w-5 text-amber-500" />,
            title: 'Optimize Your Pricing',
            description: 'Your current daily rate is slightly above the average for your experience level. Slight adjustments might increase bookings.',
            time: '1 day ago',
            action: 'Review Pricing'
        }
    ];

    const notifications = [
        {
            id: 101,
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            title: 'Payout Processed',
            description: 'Your recent payout of ৳4500 has been processed successfully.',
            time: 'Just now'
        },
        {
            id: 102,
            icon: <CalendarDays className="h-5 w-5 text-teal-500" />,
            title: 'Upcoming Tour Reminder',
            description: 'You have a tour scheduled tomorrow at 9:00 AM with Rahim Rahman.',
            time: '5 hours ago'
        },
        {
            id: 103,
            icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
            title: 'New Review Received',
            description: 'Sarah Jenkins left you a 5-star review!',
            time: 'Yesterday'
        }
    ];

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Notifications & Insights</h1>
                <p className="text-slate-500">Stay updated with your bookings and get AI-powered smart suggestions to grow your business.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Smart Suggestions Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        Smart Suggestions
                    </h3>
                    {suggestions.map((item) => (
                        <Card key={item.id} className="p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex gap-4">
                                <div className="mt-1 h-10 w-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-slate-400 font-medium">{item.time}</span>
                                        <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            {item.action} &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity Column */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                        <Bell className="h-5 w-5 text-teal-600" />
                        Recent Activity
                    </h3>
                    <div className="space-y-3">
                        {notifications.map((notif) => (
                            <div key={notif.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-4">
                                <div className="mt-1 shrink-0">{notif.icon}</div>
                                <div>
                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{notif.title}</h4>
                                    <p className="text-sm text-slate-500 mb-1">{notif.description}</p>
                                    <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
