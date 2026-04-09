"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerMessagesPage() {
    const { user, loading } = useAuth();
    const { orders, loading: ordersLoading } = useOrders('customer');

    if (loading || !user) return <div className="flex justify-center p-24"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>;

    const activeOrders = orders.filter(o => o.status !== 'cancelled');

    return (
        <div className="max-w-3xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Messages</h1>
                <p className="text-slate-500">Chat with your guides via WhatsApp — all conversations organized by trip.</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl p-4 text-sm flex gap-3">
                <MessageSquare className="h-5 w-5 shrink-0 mt-0.5" />
                <p>Ghuri uses WhatsApp for all tour communications. Once your booking is confirmed, a Ghuri operations team member will add you to a WhatsApp group with your guide.</p>
            </div>

            {ordersLoading ? (
                <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
            ) : activeOrders.length === 0 ? (
                <Card className="p-14 text-center rounded-3xl border-dashed border-slate-200">
                    <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No active conversations.</p>
                    <p className="text-sm text-slate-400">Book a trip to start chatting with a guide.</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {activeOrders.map(order => (
                        <Card key={order.id} className="p-5 rounded-2xl border-slate-200 flex items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                                    <MessageSquare className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">Trip with {order.guideName || "your guide"}</p>
                                    <p className="text-sm text-slate-500">
                                        {order.destination || "Bangladesh"} · {order.startDate?.toDate ? order.startDate.toDate().toLocaleDateString() : 'TBD'}
                                    </p>
                                </div>
                            </div>
                            <Button size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white rounded-xl shrink-0 flex items-center gap-1.5">
                                <ExternalLink className="h-4 w-4" /> WhatsApp
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
