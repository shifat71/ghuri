import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const MOCK_GUIDES = [
    {
        id: "g1",
        name: "Rafiqul Islam",
        tagline: "Uncovering the hidden stories of Sylhet & Sreemangal.",
        bio: "I've been exploring the tea gardens and waterfalls of greater Sylhet for over 8 years. I specialize in deep cultural immersions and photography tours for small groups who want to avoid the typical tourist traps.",
        coverUrl: "https://images.unsplash.com/photo-1542459030-77a8bdfd7aa8?q=80&w=1200&auto=format&fit=crop",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
        rating: 4.9,
        reviews: 124,
        trips: 340,
        nogoriStatus: "pro",
        pricePerDay: 4000,
        locations: ["Sylhet", "Sreemangal", "Sunamganj"],
        languages: ["English", "Bangla (Native)", "Sylheti"],
        services: [
            { id: "s1", title: "Full Day Photography Tour", category: "photography", price: 5000, priceType: "per_day", icon: "Camera", description: "I will bring my DSLR and drone to capture your trip professionally." },
            { id: "s2", title: "Classic City & Tea Garden Tour", category: "guided_tour", price: 4000, priceType: "per_day", icon: "MapPin", description: "Standard guiding across all major spots with storytelling." },
            { id: "s3", title: "Resort Booking Assistance", category: "hotel_booking", price: 500, priceType: "fixed", icon: "Building", description: "I will negotiate and book the best local resorts at corporate rates." }
        ],
        portfolio: [
            "https://images.unsplash.com/photo-1542459030-77a8bdfd7aa8?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1464822759023-fea09fc8f810?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=600&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1513326738677-b9628045e7f2?q=80&w=600&auto=format&fit=crop",
        ]
    },
    {
        id: "g2",
        name: "Nadia Rahman",
        tagline: "Cox's Bazar & St. Martin's local expert.",
        bio: "Born and raised near the longest sea beach in the world. I know every hidden gem along the Marine Drive.",
        coverUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop",
        avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
        rating: 4.8,
        reviews: 89,
        trips: 210,
        nogoriStatus: "verified",
        pricePerDay: 3500,
        locations: ["Cox's Bazar", "Teknaf", "St. Martin's"],
        languages: ["English", "Bangla (Native)", "Chatgaya"],
        services: [
            { id: "s1", title: "Marine Drive Scenic Tour", category: "guided_tour", price: 3500, priceType: "per_day", icon: "Car", description: "A day-long trip exploring Inani, Himchari, and hidden beaches." },
        ],
        portfolio: [
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=600&auto=format&fit=crop",
        ]
    }
];

export async function GET() {
    try {
        console.log("Starting DB seeding...");
        for (const guide of MOCK_GUIDES) {
            console.log(`Writing guide ${guide.id}...`);
            await setDoc(doc(db, "guides", guide.id), guide);
            console.log(`Successfully wrote ${guide.id}`);
        }
        console.log("Finished seeding!");
        return NextResponse.json({ message: "Seeding completed successfully" });
    } catch (error: any) {
        console.error("Seed error", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
