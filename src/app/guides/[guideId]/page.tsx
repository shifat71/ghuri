"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle, MapPin, CalendarDays, Camera, Building, Car, Compass, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function GuideProfilePage({ params }: { params: Promise<{ guideId: string }> }) {
    const { guideId } = use(params);
    const [guide, setGuide] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        const fetchGuide = async () => {
            if (!guideId) return;

            try {
                const docRef = doc(db, "guides", guideId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setGuide({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such guide!");
                }
            } catch (error) {
                console.error("Error fetching guide: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGuide();
    }, [guideId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Compass className="h-10 w-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!guide) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h1 className="text-2xl font-bold">Guide Not Found</h1>
                <Link href="/" className="text-primary mt-4 hover:underline">Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 pb-24 md:pb-0">

            {/* Header / Cover */}
            <div className="relative w-full h-48 md:h-64 lg:h-80 bg-slate-200">
                <Image
                    src={guide.coverUrl}
                    alt="Cover"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/20" />

                {/* Top actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                    <Button variant="secondary" size="icon" className="rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-slate-800">
                        <Share className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 relative">

                {/* Profile Info Card (Overlapping) */}
                <div className="relative -mt-16 md:-mt-24 bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">

                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
                        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white dark:border-slate-800 overflow-hidden shrink-0 bg-slate-200">
                            <Image src={guide.avatarUrl} alt={guide.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {guide.name}
                                </h1>
                                <Badge className="w-fit bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm space-x-1">
                                    <span>🛡️</span>
                                    <span>Nogori {guide.nogoriStatus === 'pro' ? 'Pro' : 'Verified'}</span>
                                </Badge>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base mb-3 max-w-2xl">
                                {guide.tagline}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                <div className="flex items-center gap-1.5">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{guide.rating} ({guide.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    <span>{guide.locations.join(", ")}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                                    <span>{guide.trips} trips</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">About {guide.name.split(' ')[0]}</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            {guide.bio}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {guide.languages?.map((lang: string, i: number) => (
                                <Badge key={i} variant="outline" className="bg-slate-100 dark:bg-slate-800 border-none text-slate-600 dark:text-slate-300">
                                    {lang}
                                </Badge>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Modular Profile Tabs */}
                <div className="mt-8 mb-8">
                    <Tabs defaultValue="services" className="w-full">
                        <TabsList className="w-full md:w-auto grid grid-cols-3 bg-slate-200/50 dark:bg-slate-800 p-1 mb-6 rounded-2xl">
                            <TabsTrigger value="services" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Services
                            </TabsTrigger>
                            <TabsTrigger value="portfolio" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Portfolio
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
                                Reviews
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="services" className="space-y-4 outline-none">
                            {guide.services?.map((service: any) => {
                                // Fallback icon since icon components can't be stored directly in db
                                const Icon = Camera;
                                return (
                                    <Card key={service.id} className="border-slate-200 dark:border-slate-800 shadow-sm hover:border-primary/30 transition-colors">
                                        <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{service.title}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{service.description}</p>
                                            </div>
                                            <div className="text-left sm:text-right shrink-0">
                                                <p className="font-bold text-xl text-slate-900 dark:text-white">৳{service.price}</p>
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{service.priceType.replace('_', ' ')}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </TabsContent>

                        <TabsContent value="portfolio" className="outline-none">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                                {guide.portfolio?.map((img: string, i: number) => (
                                    <div key={i} className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden group cursor-pointer bg-slate-100">
                                        <Image
                                            src={img}
                                            alt={`Portfolio image ${i + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="outline-none">
                            <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                <Star className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Reviews coming soon</h3>
                                <p className="text-sm text-slate-500 mt-1">This guide has completed 340 trips.</p>
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>

            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden sm:block">
                        <p className="text-sm font-medium text-slate-500">Starting from</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">৳{guide.pricePerDay} <span className="text-sm font-normal text-slate-500">/ day</span></p>
                    </div>
                    <Button
                        size="lg"
                        className="w-full sm:w-auto sm:min-w-[200px] h-14 text-base rounded-2xl shadow-md border border-black/10 translate-y-[-1px]"
                        onClick={() => setIsBookingModalOpen(true)}
                    >
                        <CalendarDays className="mr-2 h-5 w-5" />
                        Hire Me
                    </Button>
                </div>
            </div>

            {isBookingModalOpen && (
                <BookingWizard guide={guide} onClose={() => setIsBookingModalOpen(false)} />
            )}

        </div>
    );
}
