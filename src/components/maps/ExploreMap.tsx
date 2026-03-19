"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { useEffect } from "react";
import { OpenStreetMapProvider, GeoSearchControl } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

// Fix Leaflet default icon issues
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapSpot {
    lat: number;
    lng: number;
    label: string;
}

interface Guide {
    id: string;
    name: string;
    tagline?: string;
    avatarUrl?: string;
    rating: number;
    serviceCharge?: number;
    position?: { lat: number, lng: number };
    spots?: MapSpot[];
}

interface ExploreMapProps {
    guides: Guide[];
    onBook: (guide: any) => void;
}

function MapResizer({ guides }: { guides: Guide[] }) {
    const map = useMap();
    
    useEffect(() => {
        const allPoints: [number, number][] = [];
        guides.forEach(g => {
            if (g.spots && g.spots.length > 0) {
                g.spots.forEach(s => allPoints.push([s.lat, s.lng]));
            } else if (g.position) {
                allPoints.push([g.position.lat, g.position.lng]);
            }
        });

        if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
            }
        }
    }, [guides, map]);

    return null;
}

function SearchControl() {
    const map = useMap();
    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                countrycodes: 'bd',
            },
        });
        const searchControl = new (GeoSearchControl as any)({
            provider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: true,
            searchLabel: 'Search location to see nearby guides...',
        });
        map.addControl(searchControl);
        return () => {
            map.removeControl(searchControl);
        };
    }, [map]);
    return null;
}

export default function ExploreMap({ guides, onBook }: ExploreMapProps) {
    const defaultCenter: [number, number] = [23.8103, 90.4125]; // Dhaka

    return (
        <MapContainer
            center={defaultCenter}
            zoom={7}
            style={{ height: "600px", width: "100%", borderRadius: "2rem" }}
            className="z-0 border-4 border-white dark:border-slate-800 shadow-2xl"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <SearchControl />
            
            {guides.map(guide => {
                const guideSpots = guide.spots && guide.spots.length > 0 
                    ? guide.spots 
                    : guide.position ? [{ lat: guide.position.lat, lng: guide.position.lng, label: "Guided Spot" }] : [];

                return guideSpots.map((spot, idx) => (
                    <Marker key={`${guide.id}-${idx}`} position={[spot.lat, spot.lng]}>
                        <Popup className="custom-popup">
                            <div className="w-64 p-2 space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-teal-600 overflow-hidden shrink-0 shadow-md">
                                        {guide.avatarUrl ? (
                                            <img src={guide.avatarUrl} alt={guide.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-white font-bold">{guide.name[0]}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-900 truncate">{guide.name}</h4>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                            <span className="text-[10px] font-bold text-slate-600">{guide.rating.toFixed(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPin className="h-2 w-2 text-teal-500" />
                                            <span className="text-[9px] font-bold text-slate-400 truncate">{spot.label}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between border-t pt-3">
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Rate</p>
                                        <p className="text-sm font-black text-teal-600">৳{guide.serviceCharge?.toLocaleString()}</p>
                                    </div>
                                    <Button size="sm" onClick={() => onBook(guide)} className="h-8 rounded-lg bg-slate-900 text-xs px-4">
                                        Book Now
                                    </Button>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ));
            })}

            <MapResizer guides={guides} />
        </MapContainer>
    );
}
