"use client";

import { Order } from "@/hooks/useOrders";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, User, MessageSquare, Star } from "lucide-react";

interface TripCardProps {
    order: Order;
    onCancel: (id: string) => void;
    onReview: (id: string) => void;
}

export function CustomerTripCard({ order, onCancel, onReview }: TripCardProps) {
    return (
        <Card className="p-5 md:p-6 rounded-3xl border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 hover:shadow-md transition-shadow">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900 flex items-center justify-center shrink-0">
                <MapPin className="h-8 w-8 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h3 className="font-black text-slate-900">{order.destination || `Tour with ${order.guideName}`}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                            <User className="h-4 w-4" />
                            Guide: <span className="font-semibold">{order.guideName || "Assigned Guide"}</span>
                        </p>
                    </div>
                    <Badge variant="outline" className={`rounded-full shrink-0 px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                        order.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        order.status === 'completed' ? 'bg-slate-100 text-slate-800' :
                        'bg-red-100 text-red-800 border-red-200'
                    }`}>
                        {order.status.replace('_', ' ')}
                    </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-4 w-4" />
                        {order.startDate?.toDate ? order.startDate.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                    </span>
                    <span className="font-bold text-teal-600">৳{order.totalPrice?.toLocaleString()}</span>
                    <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${order.paymentStatus === 'unpaid' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {order.paymentStatus || 'unpaid'}
                    </span>
                </div>

                {order.specialRequests && (
                    <p className="text-xs text-slate-400 italic">"{order.specialRequests}"</p>
                )}

                <div className="flex gap-2 pt-1">
                    {order.status === 'pending' && (
                        <Button onClick={() => onCancel(order.id)} variant="outline" size="sm" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                            Cancel
                        </Button>
                    )}
                    {order.status === 'completed' && !order.reviewed && (
                        <Button onClick={() => onReview(order.id)} size="sm" className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white">
                            <Star className="h-4 w-4 mr-1" /> Leave Review
                        </Button>
                    )}
                    <Button variant="ghost" size="sm" className="rounded-xl text-teal-600">
                        <MessageSquare className="h-4 w-4 mr-1" /> WhatsApp
                    </Button>
                </div>
            </div>
        </Card>
    );
}
