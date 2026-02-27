"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Loader2 } from "lucide-react";

interface AuthModalProps {
    trigger?: React.ReactNode;
    defaultTab?: 'signin' | 'signup';
}

export function AuthModal({ trigger, defaultTab = 'signin' }: AuthModalProps) {
    const { signInWithGoogle } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    // Form State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // Sign In State
    const [signInEmail, setSignInEmail] = useState("");
    const [signInPassword, setSignInPassword] = useState("");

    // Sign Up State
    const [signUpName, setSignUpName] = useState("");
    const [signUpEmail, setSignUpEmail] = useState("");
    const [signUpPassword, setSignUpPassword] = useState("");

    const handleGoogleSignIn = async () => {
        setIsSubmitting(true);
        setErrorMsg("");
        try {
            await signInWithGoogle();
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitting(false);
            }, 500);
        } catch (error: any) {
            setErrorMsg(error.message || "Failed to sign in with Google");
            setIsSubmitting(false);
        }
    };

    const handleManualSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg("");

        try {
            await signInWithEmailAndPassword(auth, signInEmail, signInPassword);
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitting(false);
            }, 500);
        } catch (error: any) {
            setErrorMsg("Invalid email or password. Please try again.");
            setIsSubmitting(false);
        }
    };

    const handleManualSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg("");

        if (!signUpName || !signUpEmail || !signUpPassword) {
            setErrorMsg("Please fill out all fields.");
            setIsSubmitting(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, signUpEmail, signUpPassword);
            // Update auth profile with the display name
            await updateProfile(userCredential.user, {
                displayName: signUpName
            });

            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitting(false);
            }, 500);
        } catch (error: any) {
            setErrorMsg(error.message || "Failed to create account");
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || <Button variant="default">Sign In</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl p-6">
                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-slate-100 rounded-xl">
                        <TabsTrigger value="signin" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Log In</TabsTrigger>
                        <TabsTrigger value="signup" className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="mt-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">Welcome back</DialogTitle>
                            <DialogDescription className="text-center">
                                Log in to your account to book guides and manage your trips.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 mt-6">
                            {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">{errorMsg}</div>}
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-slate-200"
                                onClick={handleGoogleSignIn}
                                disabled={isSubmitting}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                </svg>
                                Log in with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or log in with</span>
                                </div>
                            </div>

                            <form className="flex flex-col gap-3" onSubmit={handleManualSignIn}>
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="h-12 rounded-xl bg-slate-50"
                                    value={signInEmail}
                                    onChange={(e) => setSignInEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="h-12 rounded-xl bg-slate-50"
                                    value={signInPassword}
                                    onChange={(e) => setSignInPassword(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl mt-1" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Log In"}
                                </Button>
                            </form>
                        </div>
                    </TabsContent>

                    <TabsContent value="signup" className="mt-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">Create an account</DialogTitle>
                            <DialogDescription className="text-center">
                                Join Ghuri to start exploring or guiding.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col gap-4 mt-6">
                            {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">{errorMsg}</div>}
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full h-12 rounded-xl flex items-center justify-center gap-2 border-slate-200"
                                onClick={handleGoogleSignIn}
                                disabled={isSubmitting}
                            >
                                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                                    <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                                    <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                                    <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                                    <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26538 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
                                </svg>
                                Sign up with Google
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-slate-500">Or sign up with</span>
                                </div>
                            </div>

                            <form className="flex flex-col gap-3" onSubmit={handleManualSignUp}>
                                <Input
                                    type="text"
                                    placeholder="Full Name"
                                    className="h-12 rounded-xl bg-slate-50"
                                    value={signUpName}
                                    onChange={(e) => setSignUpName(e.target.value)}
                                    required
                                />
                                <Input
                                    type="email"
                                    placeholder="Email address"
                                    className="h-12 rounded-xl bg-slate-50"
                                    value={signUpEmail}
                                    onChange={(e) => setSignUpEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    className="h-12 rounded-xl bg-slate-50"
                                    value={signUpPassword}
                                    onChange={(e) => setSignUpPassword(e.target.value)}
                                    required
                                />
                                <Button type="submit" className="w-full h-12 rounded-xl mt-1" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign Up"}
                                </Button>
                            </form>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
