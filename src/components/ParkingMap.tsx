import { useEffect, useRef } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { Marker } from "react-leaflet/Marker";
import { Popup } from "react-leaflet/Popup";
import { useMap } from "react-leaflet/hooks";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ParkingSlot, UserLocation } from "@/types/parking";
import { Navigation } from "lucide-react";

// Fix default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;

const slotColors = {
  vacant: "hsl(142, 70%, 50%)",
  occupied: "hsl(0, 72%, 55%)",
  reserved: "hsl(45, 93%, 58%)",
};

function createSlotIcon(status: ParkingSlot["status"], isUserSlot: boolean) {
  const color = slotColors[status];
  const size = isUserSlot ? 20 : 14;
  const border = isUserSlot ? "3px solid hsl(168, 80%, 48%)" : "2px solid hsl(220, 14%, 18%)";

  return L.divIcon({
    className: "parking-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${border};
      border-radius: 50%;
      box-shadow: 0 0 12px ${color};
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "user-marker",
    html: `<div style="
      width: 16px;
      height: 16px;
      background: hsl(210, 100%, 60%);
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 16px hsl(210, 100%, 60%);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FitBounds({ slots, userLocation }: { slots: ParkingSlot[]; userLocation: UserLocation | null }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current) return;
    const points: L.LatLngExpression[] = slots.map((s) => [s.lat, s.lng]);
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 17 });
      hasFit.current = true;
    }
  }, [slots, userLocation, map]);

  return null;
}

interface Props {
  slots: ParkingSlot[];
  userLocation: UserLocation | null;
  bookedSlotId: string | null;
  onBook: (id: string) => void;
  disabled: boolean;
}

export default function ParkingMap({ slots, userLocation, bookedSlotId, onBook, disabled }: Props) {
  const center: L.LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [slots[0]?.lat ?? 12.9716, slots[0]?.lng ?? 77.5946];

  const openNavigation = (lat: number, lng: number) => {
    const origin = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : "";
    window.open(`https://www.google.com/maps/dir/?api=1${origin}&destination=${lat},${lng}&travelmode=driving`, "_blank");
  };

  return (
    <div className="rounded-xl border-2 border-border overflow-hidden" style={{ height: 400 }}>
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: "100%", width: "100%", background: "hsl(220, 20%, 7%)" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds slots={slots} userLocation={userLocation} />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserIcon()}>
            <Popup className="dark-popup">
              <span className="text-sm font-medium">Your Location</span>
            </Popup>
          </Marker>
        )}

        {slots.map((slot) => {
          const isUser = slot.id === bookedSlotId;
          return (
            <Marker
              key={slot.id}
              position={[slot.lat, slot.lng]}
              icon={createSlotIcon(slot.status, isUser)}
            >
              <Popup className="dark-popup">
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{slot.label}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-full"
                      style={{
                        background: slotColors[slot.status],
                        color: slot.status === "reserved" ? "#000" : "#fff",
                      }}
                    >
                      {slot.status}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {slot.status === "vacant" && !disabled && (
                      <button
                        onClick={() => onBook(slot.id)}
                        className="flex-1 text-xs font-medium py-1.5 px-3 rounded-md text-white"
                        style={{ background: slotColors.vacant }}
                      >
                        Book
                      </button>
                    )}
                    <button
                      onClick={() => openNavigation(slot.lat, slot.lng)}
                      className="flex items-center justify-center py-1.5 px-2 rounded-md bg-gray-700 hover:bg-gray-600"
                    >
                      <Navigation className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
