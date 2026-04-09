"use client";

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

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

interface GuidePublicMapProps {
    spots: MapSpot[];
    interactive?: boolean;
}

function MapResizer({ spots }: { spots: MapSpot[] }) {
    const map = useMap();
    
    useEffect(() => {
        if (spots.length > 0) {
            const bounds = L.latLngBounds(spots.map(s => [s.lat, s.lng]));
            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        }
    }, [spots, map]);

    return null;
}

export default function GuidePublicMap({ spots, interactive = false }: GuidePublicMapProps) {
    const defaultCenter: [number, number] = [23.8103, 90.4125]; // Dhaka

    return (
        <MapContainer
            center={spots.length > 0 ? [spots[0].lat, spots[0].lng] : defaultCenter}
            zoom={spots.length > 0 ? 15 : 7}
            dragging={interactive}
            touchZoom={interactive}
            doubleClickZoom={interactive}
            scrollWheelZoom={interactive}
            boxZoom={interactive}
            keyboard={interactive}
            style={{ height: "350px", width: "100%", borderRadius: "1.5rem" }}
            className="z-0 border-2 border-slate-100 shadow-sm"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {spots.map((spot, idx) => (
                <Marker key={`${spot.lat}-${spot.lng}-${idx}`} position={[spot.lat, spot.lng]}>
                    <Tooltip direction="top" offset={[0, -40]} opacity={1}>
                        <span className="text-[10px] font-bold">{spot.label.split(',')[0]}</span>
                    </Tooltip>
                    <Popup>
                        <div className="p-1">
                            <p className="text-xs font-bold text-slate-900">{spot.label}</p>
                            <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-medium">Service Spot</p>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapResizer spots={spots} />
        </MapContainer>
    );
}
