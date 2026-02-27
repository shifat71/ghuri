import Link from "next/link";
import { Home, Search, Calendar, User } from "lucide-react";

export function BottomNav() {
    return (
        <div className="fixed bottom-0 left-0 z-50 w-full md:hidden h-16 bg-white/80 backdrop-blur-md border-t border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 pb-safe">
            <div className="grid h-full w-full grid-cols-4 px-2">

                <Link href="/" className="inline-flex flex-col items-center justify-center gap-1 hover:text-primary text-primary">
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Explore</span>
                </Link>

                <Link href="/search" className="inline-flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-primary dark:text-slate-400">
                    <Search className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Search</span>
                </Link>

                <Link href="/customer/dashboard" className="inline-flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-primary dark:text-slate-400">
                    <Calendar className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Bookings</span>
                </Link>

                <Link href="/customer/profile" className="inline-flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-primary dark:text-slate-400">
                    <User className="h-5 w-5" />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>

            </div>
        </div>
    );
}
