"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

// Fix Leaflet default icon issues
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface MapSpot {
    lat: number;
    lng: number;
    label: string;
}

interface MapPickerProps {
    spots: MapSpot[];
    onChange: (spots: MapSpot[]) => void;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`);
        const data = await response.json();
        return data.display_name || `Point at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) {
        return `Point at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

function MapEvents({ onAdd }: { onAdd: (lat: number, lng: number, label: string) => void }) {
    const [isGeocoding, setIsGeocoding] = useState(false);

    useMapEvents({
        async click(e) {
            if (isGeocoding) return;
            setIsGeocoding(true);
            const label = await reverseGeocode(e.latlng.lat, e.latlng.lng);
            onAdd(e.latlng.lat, e.latlng.lng, label);
            setIsGeocoding(false);
        },
    });

    return isGeocoding ? (
        <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[10px] font-bold">
            <Loader2 className="h-3 w-3 animate-spin text-teal-600" />
            Identifying Location...
        </div>
    ) : null;
}

function SearchField({ onAdd }: { onAdd: (lat: number, lng: number, label: string) => void }) {
    const map = useMap();
    
    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                'accept-language': 'en',
                countrycodes: 'bd',
            },
        });
        
        const searchControl = new (SearchControl as any)({
            provider,
            style: 'bar',
            showMarker: false,
            autoClose: true,
            retainZoomLevel: false,
            animateZoom: true,
            keepResult: false,
            searchLabel: 'Search any location in Bangladesh...',
            updateMap: true,
        });

        map.addControl(searchControl);

        // Listen for the location selection
        map.on('geosearch/showlocation', (result: any) => {
            if (result.location) {
                onAdd(result.location.y, result.location.x, result.location.label);
                map.setView([result.location.y, result.location.x], 16);
            }
        });

        // Hack to handle Enter key better on the search input
        const container = searchControl.getContainer();
        const input = container.querySelector('input');
        if (input) {
            input.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    // Give it a small delay to let the results populate
                    setTimeout(() => {
                        const firstResult = container.querySelector('.results > div');
                        if (firstResult) {
                            (firstResult as HTMLElement).click();
                        }
                    }, 100);
                }
            });
        }

        return () => {
            map.removeControl(searchControl);
        };
    }, [map, onAdd]);

    return null;
}

export default function LeafletMapPicker({ spots, onChange }: MapPickerProps) {
    const defaultCenter: [number, number] = [23.8103, 90.4125]; // Dhaka

    const addSpot = useCallback((lat: number, lng: number, label: string) => {
        const newSpot: MapSpot = { lat, lng, label };
        onChange([...spots, newSpot]);
    }, [spots, onChange]);

    const removeSpot = (index: number) => {
        const newSpots = spots.filter((_, i) => i !== index);
        onChange(newSpots);
    };

    const updateSpotName = (index: number, newLabel: string) => {
        const newSpots = [...spots];
        newSpots[index] = { ...newSpots[index], label: newLabel };
        onChange(newSpots);
    };

    return (
        <MapContainer
            center={spots.length > 0 ? [spots[spots.length-1].lat, spots[spots.length-1].lng] : defaultCenter}
            zoom={spots.length > 0 ? 16 : 13}
            style={{ height: "500px", width: "100%", borderRadius: "1.5rem" }}
            className="z-0 border-2 border-slate-100 dark:border-slate-800 shadow-inner"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {spots.map((spot, idx) => (
                <Marker key={`${spot.lat}-${spot.lng}-${idx}`} position={[spot.lat, spot.lng]}>
                    <Tooltip direction="top" offset={[0, -40]} opacity={1}>
                        <span className="text-[9px] font-bold">{spot.label.split(',')[0]}</span>
                    </Tooltip>
                    <Popup className="min-w-[200px]" autoPan={true}>
                        <div className="p-2 space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Spot Label</p>
                                <input 
                                    className="w-full text-xs font-bold border-b border-slate-200 focus:border-teal-500 outline-none pb-1"
                                    value={spot.label}
                                    onChange={(e) => updateSpotName(idx, e.target.value)}
                                    placeholder="e.g. Meeting Point A"
                                />
                            </div>
                            <Button 
                                variant="destructive" 
                                size="sm" 
                                className="w-full h-8 text-[10px] gap-2 rounded-lg"
                                onClick={() => removeSpot(idx)}
                            >
                                <Trash2 className="h-3 w-3" /> Remove Spot
                            </Button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            <MapEvents onAdd={addSpot} />
            <SearchField onAdd={addSpot} />
        </MapContainer>
    );
}
