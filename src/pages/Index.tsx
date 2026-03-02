import { useState, useCallback } from "react";
import { ParkingSlot } from "@/types/parking";
import { useGeolocation, getDistanceMeters } from "@/hooks/useGeolocation";
import ParkingSlotCard from "@/components/ParkingSlotCard";
import BookingTimer from "@/components/BookingTimer";
import StatusLegend from "@/components/StatusLegend";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Crown, RefreshCw, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";

// Simulated parking lot center (will be near user for demo)
const LOT_CENTER = { lat: 0, lng: 0 }; // Will be set dynamically

const generateSlots = (): ParkingSlot[] => {
  const statuses: Array<ParkingSlot["status"]> = [
    "vacant", "occupied", "vacant", "vacant", "occupied",
    "vacant", "occupied", "vacant", "vacant", "vacant",
    "occupied", "vacant", "vacant", "occupied", "vacant",
    "vacant", "occupied", "occupied", "vacant", "vacant",
  ];
  return statuses.map((status, i) => ({
    id: `slot-${i + 1}`,
    label: `${String.fromCharCode(65 + Math.floor(i / 5))}${(i % 5) + 1}`,
    status,
    lat: 12.9716 + (Math.random() - 0.5) * 0.002,
    lng: 77.5946 + (Math.random() - 0.5) * 0.002,
  }));
};

export default function Index() {
  const [slots, setSlots] = useState<ParkingSlot[]>(generateSlots);
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const { toast } = useToast();

  const bookedSlot = slots.find((s) => s.id === bookedSlotId);

  const handleBook = useCallback(
    (slotId: string) => {
      if (bookedSlotId) {
        toast({ title: "Already booked", description: "Cancel your current booking first.", variant: "destructive" });
        return;
      }

      const slot = slots.find((s) => s.id === slotId);
      if (!slot) return;

      // GPS validation
      if (!location) {
        toast({ title: "Location required", description: "Enable GPS to book a slot.", variant: "destructive" });
        return;
      }

      const distance = getDistanceMeters(location.lat, location.lng, slot.lat, slot.lng);
      if (distance > 500) {
        toast({
          title: "Too far away",
          description: `You're ${Math.round(distance)}m away. Must be within 500m.`,
          variant: "destructive",
        });
        return;
      }

      const duration = isPremium ? 15 : 5;
      const expiresAt = Date.now() + duration * 60 * 1000;

      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId ? { ...s, status: "reserved" as const, bookedBy: "user", expiresAt } : s
        )
      );
      setBookedSlotId(slotId);
      toast({ title: "Slot booked!", description: `${slot.label} reserved for ${duration} minutes.` });
    },
    [bookedSlotId, slots, location, isPremium, toast]
  );

  const handleExpire = useCallback(() => {
    if (!bookedSlotId) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.id === bookedSlotId
          ? { ...s, status: "vacant" as const, bookedBy: undefined, expiresAt: undefined }
          : s
      )
    );
    setBookedSlotId(null);
    toast({ title: "Booking expired", description: "Your reservation has timed out." });
  }, [bookedSlotId, toast]);

  const handleCancel = useCallback(() => {
    if (!bookedSlotId) return;
    setSlots((prev) =>
      prev.map((s) =>
        s.id === bookedSlotId
          ? { ...s, status: "vacant" as const, bookedBy: undefined, expiresAt: undefined }
          : s
      )
    );
    setBookedSlotId(null);
    toast({ title: "Booking cancelled" });
  }, [bookedSlotId, toast]);

  const vacantCount = slots.filter((s) => s.status === "vacant").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">ParkSmart</h1>
              <p className="text-xs text-muted-foreground">Intelligent Parking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
              <Crown className="h-3.5 w-3.5 text-slot-reserved" />
              <Label htmlFor="premium" className="text-xs font-medium text-secondary-foreground cursor-pointer">
                Premium
              </Label>
              <Switch id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* Stats Bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Parking Lot A</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>MG Road, Bangalore</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-mono text-primary">{vacantCount}</p>
            <p className="text-xs text-muted-foreground">spots free</p>
          </div>
        </div>

        {/* Location Status */}
        <div className="flex items-center justify-between rounded-xl bg-secondary/50 border border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Locate className={`h-4 w-4 ${location ? "text-slot-vacant" : "text-muted-foreground"}`} />
            <span className="text-sm text-secondary-foreground">
              {geoLoading
                ? "Getting location..."
                : location
                ? "GPS active — location verified"
                : geoError || "Location unavailable"}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={requestLocation} className="h-8 w-8 p-0">
            <RefreshCw className={`h-3.5 w-3.5 ${geoLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Active Booking */}
        {bookedSlot && (
          <BookingTimer
            slot={bookedSlot}
            onExpire={handleExpire}
            onCancel={handleCancel}
            isPremium={isPremium}
          />
        )}

        {/* Legend */}
        <StatusLegend />

        {/* Parking Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {slots.map((slot) => (
            <ParkingSlotCard
              key={slot.id}
              slot={slot}
              onBook={handleBook}
              disabled={!!bookedSlotId || !location}
              isUserSlot={slot.id === bookedSlotId}
            />
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          {isPremium ? "Premium: 15-min reservation" : "Standard: 5-min reservation"} • Must be within 500m to book
        </p>
      </main>
    </div>
  );
}
