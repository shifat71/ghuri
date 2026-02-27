import Image from "next/image";
import { Search, MapPin, Camera, Building, Car, Compass } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GuideCard, GuideCardProps } from "@/components/guide/GuideCard";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// Mock Data for UI Visualization (Categories & Destinations)
const CATEGORIES = [
  { id: 1, name: "Photography", icon: Camera, color: "bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-100 dark:border-teal-900/50" },
  { id: 2, name: "Local Tours", icon: Compass, color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50" },
  { id: 3, name: "Transport", icon: Car, color: "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-100 dark:border-orange-900/50" },
  { id: 4, name: "Hotels", icon: Building, color: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50" },
];

const DESTINATIONS = [
  { id: "syl", name: "Sylhet", image: "https://images.unsplash.com/photo-1542459030-77a8bdfd7aa8?q=80&w=400&auto=format&fit=crop" },
  { id: "cox", name: "Cox's Bazar", image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop" },
  { id: "saj", name: "Sajek Valley", image: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?q=80&w=400&auto=format&fit=crop" },
];

export const dynamic = 'force-dynamic';

export default async function Home() {
  let guides: GuideCardProps[] = [];
  try {
    const querySnapshot = await getDocs(collection(db, "guides"));
    guides = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GuideCardProps[];
  } catch (error) {
    console.error("Error fetching guides server-side:", error);
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 md:px-8 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 dark:from-slate-950 dark:via-teal-950 dark:to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621687947404-e41b3d139088?q=80&w=1920&auto=format&fit=crop')] opacity-[0.15] dark:opacity-[0.1] bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/50 to-transparent"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-center flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-sm">
            Travel Bangladesh with <br className="hidden md:block" />
            <span className="text-emerald-300">Nogori Verified</span> locals.
          </h1>
          <p className="text-lg md:text-xl text-teal-50 font-medium mb-10 max-w-2xl drop-shadow-sm">
            Book photographers, tour guides, and transport directly. No agencies. Just authentic experiences.
          </p>

          {/* Prominent Search Bar */}
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur shadow-2xl p-2 md:p-3 rounded-full flex items-center border border-white/20">
            <div className="flex-1 flex items-center pl-4">
              <MapPin className="h-5 w-5 text-teal-600 shrink-0" />
              <Input
                type="text"
                placeholder="Where to? (e.g. Sylhet, Cox's Bazar)"
                className="border-0 shadow-none focus-visible:ring-0 text-base h-12 bg-transparent text-slate-900 placeholder:text-slate-500"
              />
            </div>
            <button className="bg-teal-700 hover:bg-teal-800 text-white h-12 px-6 md:px-8 rounded-full font-bold transition-transform active:scale-95 shrink-0 flex items-center gap-2 shadow-sm">
              <Search className="h-5 w-5 md:hidden" />
              <span className="hidden md:block">Explore</span>
            </button>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Featured Destinations (Horizontal Scroll) */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Top Destinations</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {DESTINATIONS.map((dest) => (
            <div key={dest.id} className="relative h-48 w-40 md:h-64 md:w-52 rounded-3xl overflow-hidden shrink-0 group cursor-pointer bg-slate-100 dark:bg-slate-800">
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-lg leading-tight">{dest.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Guides Feed */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto w-full mt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured Guides</h2>
            <p className="text-muted-foreground text-sm mt-1">Nogori Verified locals ready for your trip</p>
          </div>
        </div>

        {guides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <GuideCard key={guide.id} {...guide} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-dashed">
            <Compass className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No guides found</h3>
            <p className="text-muted-foreground">Run the seeder or check your Firestore database.</p>
          </div>
        )}
      </section>
    </div>
  );
}
