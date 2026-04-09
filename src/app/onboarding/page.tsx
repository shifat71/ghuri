"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Map, Camera, ArrowRight, ArrowLeft, Loader2, MapPin, Languages, User, Sparkles, Upload, ShieldCheck, GraduationCap } from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { isStudentEmail, isStudentEmailAsync, getAcceptedDomains } from "@/lib/verification";

type Step = "role" | "guide-profile" | "guide-verification" | "guide-services";

export default function OnboardingPage() {
    const { user, dbUser, loading } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<Step>("role");
    const [selectedRole, setSelectedRole] = useState<"customer" | "guide" | null>(null);

    // Guide Profile State
    const [guideName, setGuideName] = useState("");
    const [guideTagline, setGuideTagline] = useState("");
    const [guideBio, setGuideBio] = useState("");
    const [guideLocations, setGuideLocations] = useState("");
    const [guideLanguages, setGuideLanguages] = useState("");
    const [guideAvatarUrl, setGuideAvatarUrl] = useState("");
    const [guideCoverUrl, setGuideCoverUrl] = useState("");
    const [guidePricePerDay, setGuidePricePerDay] = useState("");

    // Student ID Verification
    const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
    const [studentIdPreview, setStudentIdPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Guide First Service
    const [serviceTitle, setServiceTitle] = useState("");
    const [serviceDescription, setServiceDescription] = useState("");
    const [servicePrice, setServicePrice] = useState("");
    const [serviceCategory, setServiceCategory] = useState("guided_tour");
    const [servicePriceType, setServicePriceType] = useState("per_day");

    // Use sync check for UI hints, async check happens at submission time
    const userIsStudent = user?.email ? isStudentEmail(user.email) : false;

    // Pre-fetch accepted domains from Firestore on mount (warms the cache)
    useEffect(() => { getAcceptedDomains(); }, []);

    // Redirect if they already have a role or aren't logged in
    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            } else if (dbUser?.role) {
                router.push(`/dashboard/${dbUser.role}`);
            } else {
                // Pre-fill name and avatar from Auth provider
                setGuideName(user.displayName || "");
                setGuideAvatarUrl(user.photoURL || "");
            }
        }
    }, [user, dbUser, loading, router]);

    const handleStudentIdSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be under 5MB");
            return;
        }
        setStudentIdFile(file);
        setStudentIdPreview(URL.createObjectURL(file));
    };

    const handleSelectRole = async (role: "customer" | "guide") => {
        if (role === "customer") {
            if (!user) return;
            setIsSubmitting(true);
            try {
                await setDoc(doc(db, "users", user.uid), {
                    role: "customer",
                    displayName: user.displayName || "User",
                    email: user.email,
                    photoURL: user.photoURL || null,
                    isStudentEmail: user.email ? isStudentEmail(user.email) : false,
                    nidStatus: "not_submitted",
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                });
                window.location.href = `/dashboard/customer`;
            } catch (error) {
                console.error("Error setting role:", error);
                setIsSubmitting(false);
            }
        } else {
            setSelectedRole("guide");
            setStep("guide-profile");
        }
    };

    const handleGuideProfileNext = () => {
        if (!guideName.trim()) return;
        setStep("guide-verification");
    };

    const handleVerificationNext = () => {
        setStep("guide-services");
    };

    const handleGuideSubmit = async () => {
        if (!user) return;
        setIsSubmitting(true);

        const locationsArray = guideLocations.split(",").map(s => s.trim()).filter(Boolean);
        const languagesArray = guideLanguages.split(",").map(s => s.trim()).filter(Boolean);
        const services: any[] = [];

        if (serviceTitle.trim()) {
            services.push({
                id: "s1",
                title: serviceTitle,
                category: serviceCategory,
                price: Number(servicePrice) || 0,
                priceType: servicePriceType,
                description: serviceDescription,
                icon: "Camera"
            });
        }

        try {
            // Upload student ID if provided (non-blocking — failure doesn't prevent sign-up)
            let studentIdUrl = "";
            if (studentIdFile) {
                setIsUploading(true);
                try {
                    const storageRef = ref(storage, `verification/${user.uid}/student_id_${Date.now()}`);
                    await uploadBytes(storageRef, studentIdFile);
                    studentIdUrl = await getDownloadURL(storageRef);
                } catch (uploadErr) {
                    // Storage rules may not be deployed yet; guide can re-upload from dashboard
                    console.warn("Student ID upload failed (will proceed without it):", uploadErr);
                } finally {
                    setIsUploading(false);
                }
            }

            // Check student email against Firestore-stored accepted domains
            const isVerifiedStudent = user.email
                ? await isStudentEmailAsync(user.email)
                : false;

            // Determine nogori status:
            // - Student email from accepted list → auto-verified instantly
            // - Manual student ID upload succeeded → id_submitted (admin reviews)
            // - No upload / upload failed → pending (can upload from dashboard later)
            let nogoriStatus = "pending";
            if (isVerifiedStudent) {
                nogoriStatus = "verified"; // Auto-accepted: edu email in accepted list
            } else if (studentIdUrl) {
                nogoriStatus = "id_submitted"; // Needs manual admin review
            }

            // Create base user document
            await setDoc(doc(db, "users", user.uid), {
                role: "guide",
                displayName: guideName,
                email: user.email,
                photoURL: guideAvatarUrl || user.photoURL || null,
                isStudentEmail: isVerifiedStudent,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Create full guide profile document (including email for admin visibility)
            await setDoc(doc(db, "guides", user.uid), {
                name: guideName,
                email: user.email,
                tagline: guideTagline,
                bio: guideBio,
                avatarUrl: guideAvatarUrl || user.photoURL || "",
                coverUrl: guideCoverUrl || "",
                rating: 0,
                reviews: 0,
                trips: 0,
                nogoriStatus,
                pricePerDay: Number(guidePricePerDay) || 0,
                locations: locationsArray,
                languages: languagesArray,
                services: services,
                portfolio: [],
                studentIdUrl: studentIdUrl || null,
                isStudentEmail: isVerifiedStudent,
                createdAt: serverTimestamp(),
            });

            window.location.href = `/dashboard/guide`;
        } catch (error) {
            console.error("Error creating guide profile:", error);
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    if (loading || isSubmitting || dbUser?.role) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-slate-500">
                        {isUploading ? "Uploading verification document..." : "Setting up your profile..."}
                    </p>
                </div>
            </div>
        );
    }

    // ─── STEP 1: Role Selection ─────────────────────────────────
    if (step === "role") {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-20 px-4 bg-slate-50">
                <div className="max-w-3xl w-full text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                        Welcome to <span className="text-teal-600">Ghuri</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        Before we continue, please tell us how you plan to use the platform so we can personalize your experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    <Card className="p-8 border-2 border-transparent hover:border-teal-500 transition-all cursor-pointer group bg-white rounded-3xl" onClick={() => handleSelectRole("customer")}>
                        <div className="h-20 w-20 rounded-2xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Map className="h-10 w-10 text-teal-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">I want to Explore</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            I&apos;m a traveler looking to find and book amazing Nogori Verified local guides for my next trip.
                        </p>
                        <Button className="w-full rounded-xl" size="lg">Continue as Traveler</Button>
                    </Card>

                    <Card className="p-8 border-2 border-transparent hover:border-orange-500 transition-all cursor-pointer group bg-white rounded-3xl" onClick={() => handleSelectRole("guide")}>
                        <div className="h-20 w-20 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Camera className="h-10 w-10 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">I want to Guide</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            I&apos;m a local expert, photographer, or planner looking to offer my travel services and earn money.
                        </p>
                        <Button className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white" size="lg">Apply as Guide</Button>
                    </Card>
                </div>
            </div>
        );
    }

    // ─── STEP 2: Guide Profile Info ─────────────────────────────
    if (step === "guide-profile") {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-12 px-4 bg-slate-50">
                <div className="max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-8">
                        <button onClick={() => setStep("role")} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="h-2 flex-1 bg-teal-500 rounded-full"></div>
                            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
                            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Step 1 of 3</span>
                    </div>

                    <div className="text-center mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                            <User className="h-7 w-7 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Set Up Your Profile</h1>
                        <p className="text-slate-500">This information will be visible on your public guide page.</p>
                    </div>

                    <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">Display Name <span className="text-red-500">*</span></Label>
                                <Input value={guideName} onChange={(e) => setGuideName(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="Your full name" required />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">Tagline</Label>
                                <Input value={guideTagline} onChange={(e) => setGuideTagline(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="e.g. Uncovering the hidden stories of Sylhet" />
                                <p className="text-xs text-slate-500">A catchy one-liner about your guiding expertise.</p>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">Short Bio</Label>
                                <Textarea value={guideBio} onChange={(e) => setGuideBio(e.target.value)} className="min-h-[100px] bg-slate-50 rounded-xl resize-none" placeholder="Tell travelers about your experience and what makes you great..." />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Locations</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input value={guideLocations} onChange={(e) => setGuideLocations(e.target.value)} className="pl-10 h-12 bg-slate-50 rounded-xl" placeholder="Sylhet, Sreemangal" />
                                    </div>
                                    <p className="text-xs text-slate-500">Comma separated.</p>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Languages</Label>
                                    <div className="relative">
                                        <Languages className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input value={guideLanguages} onChange={(e) => setGuideLanguages(e.target.value)} className="pl-10 h-12 bg-slate-50 rounded-xl" placeholder="English, Bangla" />
                                    </div>
                                    <p className="text-xs text-slate-500">Comma separated.</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Avatar URL</Label>
                                    <Input type="url" value={guideAvatarUrl} onChange={(e) => setGuideAvatarUrl(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="https://..." />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Cover Photo URL</Label>
                                    <Input type="url" value={guideCoverUrl} onChange={(e) => setGuideCoverUrl(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="https://..." />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">Price Per Day (BDT)</Label>
                                <Input type="number" value={guidePricePerDay} onChange={(e) => setGuidePricePerDay(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="4000" />
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <Button onClick={handleGuideProfileNext} disabled={!guideName.trim()} className="h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold gap-2">
                                Next: Verification
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // ─── STEP 3: Student ID Verification ────────────────────────
    if (step === "guide-verification") {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-12 px-4 bg-slate-50">
                <div className="max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-8">
                        <button onClick={() => setStep("guide-profile")} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="h-2 flex-1 bg-teal-500 rounded-full"></div>
                            <div className="h-2 flex-1 bg-teal-500 rounded-full"></div>
                            <div className="h-2 flex-1 bg-slate-200 rounded-full"></div>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Step 2 of 3</span>
                    </div>

                    <div className="text-center mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="h-7 w-7 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Verify Your Identity</h1>
                        <p className="text-slate-500">You can upload your student ID now or do it later from your dashboard.</p>
                    </div>

                    {/* Student Email Auto-Detect Banner */}
                    {userIsStudent ? (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                            <GraduationCap className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-800">Student email detected — you&apos;ll be auto-verified!</p>
                                <p className="text-xs text-emerald-600 mt-0.5">
                                    Your email ({user?.email}) is from a recognized institution. No ID upload needed.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Student ID required to receive bookings</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    You can skip this for now and upload from your dashboard. You won&apos;t be able to accept bookings until verified.
                                </p>
                            </div>
                        </div>
                    )}

                    <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">
                                    Student ID Card <span className="text-slate-400 font-normal text-xs">(optional — can upload later)</span>
                                </Label>
                                <p className="text-xs text-slate-500">
                                    Upload a clear photo of your student ID card (front side). Max 5MB.
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleStudentIdSelect}
                                    className="hidden"
                                />

                                {studentIdPreview ? (
                                    <div className="relative mt-2">
                                        <img
                                            src={studentIdPreview}
                                            alt="Student ID preview"
                                            className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-slate-50"
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setStudentIdFile(null);
                                                setStudentIdPreview(null);
                                            }}
                                            className="absolute top-2 right-2 rounded-lg bg-white/90 text-xs"
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="mt-2 flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors cursor-pointer"
                                    >
                                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                            <Upload className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-slate-700">Click to upload your Student ID</p>
                                            <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
                            <Button variant="ghost" onClick={handleVerificationNext} className="text-slate-500 font-medium rounded-xl">
                                {studentIdFile ? "Skip upload, do it later" : "Skip for now"}
                            </Button>
                            <Button
                                onClick={handleVerificationNext}
                                disabled={false}
                                className="h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold gap-2"
                            >
                                Next: Add a Service
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // ─── STEP 4: First Service ──────────────────────────────────
    if (step === "guide-services") {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center py-12 px-4 bg-slate-50">
                <div className="max-w-2xl w-full">
                    <div className="flex items-center gap-3 mb-8">
                        <button onClick={() => setStep("guide-verification")} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex-1 flex items-center gap-2">
                            <div className="h-2 flex-1 bg-teal-500 rounded-full"></div>
                            <div className="h-2 flex-1 bg-teal-500 rounded-full"></div>
                            <div className="h-2 flex-1 bg-teal-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-slate-500 font-medium">Step 3 of 3</span>
                    </div>

                    <div className="text-center mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-7 w-7 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Add Your First Service</h1>
                        <p className="text-slate-500">What&apos;s the main thing travelers can book you for? You can add more later.</p>
                    </div>

                    <Card className="p-6 md:p-8 rounded-3xl border-slate-200 shadow-sm bg-white">
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">Service Title</Label>
                                <Input value={serviceTitle} onChange={(e) => setServiceTitle(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="e.g. Full Day Photography Tour" />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-slate-700 font-semibold">Description</Label>
                                <Textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} className="min-h-[80px] bg-slate-50 rounded-xl resize-none" placeholder="What's included in this service?" />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Category</Label>
                                    <select value={serviceCategory} onChange={(e) => setServiceCategory(e.target.value)} className="flex h-12 w-full rounded-xl border-none bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                        <option value="guided_tour">Guided Tour</option>
                                        <option value="photography">Photography</option>
                                        <option value="hotel_booking">Hotel Booking</option>
                                        <option value="transportation">Transportation</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Price (BDT)</Label>
                                    <Input type="number" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} className="h-12 bg-slate-50 rounded-xl" placeholder="5000" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-slate-700 font-semibold">Pricing</Label>
                                    <select value={servicePriceType} onChange={(e) => setServicePriceType(e.target.value)} className="flex h-12 w-full rounded-xl border-none bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
                                        <option value="per_day">Per Day</option>
                                        <option value="per_person">Per Person</option>
                                        <option value="fixed">Fixed Price</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-6 border-t border-slate-100">
                            <Button variant="ghost" onClick={handleGuideSubmit} className="text-slate-500 font-medium rounded-xl">
                                Skip for now
                            </Button>
                            <Button onClick={handleGuideSubmit} disabled={isSubmitting} className="h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 font-bold gap-2">
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        Complete Setup
                                        <Sparkles className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return null;
}
