import { useEffect, useState } from "react";
import { Timer, Navigation, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParkingSlot, UserLocation } from "@/types/parking";

interface Props {
  slot: ParkingSlot;
  onExpire: () => void;
  onCancel: () => void;
  isPremium: boolean;
  userLocation: UserLocation | null;
}

export default function BookingTimer({ slot, onExpire, onCancel, isPremium, userLocation }: Props) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!slot.expiresAt) return;
    const interval = setInterval(() => {
      const left = Math.max(0, slot.expiresAt! - Date.now());
      setRemaining(left);
      if (left <= 0) {
        onExpire();
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [slot.expiresAt, onExpire]);

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const progress = slot.expiresAt
    ? (remaining / ((isPremium ? 15 : 5) * 60 * 1000)) * 100
    : 0;

  const openMaps = () => {
    const origin = userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : "";
    window.open(
      `https://www.google.com/maps/dir/?api=1${origin}&destination=${slot.lat},${slot.lng}&travelmode=driving`,
      "_blank"
    );
  };

  return (
    <div className="gradient-card rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Booking Active</h3>
        </div>
        {isPremium && (
          <span className="flex items-center gap-1 text-xs font-mono bg-slot-reserved/20 text-slot-reserved px-2 py-1 rounded-full">
            <Crown className="h-3 w-3" /> Premium
          </span>
        )}
      </div>

      <div className="text-center space-y-2">
        <p className="text-muted-foreground text-sm">Slot {slot.label}</p>
        <p className="text-4xl font-mono font-bold text-foreground tracking-wider">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={openMaps} className="flex-1 gap-2" variant="default">
          <Navigation className="h-4 w-4" />
          Navigate
        </Button>
        <Button onClick={onCancel} variant="secondary" className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
}
