import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParkingSlot } from "@/types/parking";
import { useGeolocation, getDistanceMeters } from "@/hooks/useGeolocation";
import { useESP32Sensor } from "@/hooks/useESP32Sensor";
import ParkingSlotCard from "@/components/ParkingSlotCard";
import ParkingMap from "@/components/ParkingMap";
import BookingTimer from "@/components/BookingTimer";
import StatusLegend from "@/components/StatusLegend";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Car, MapPin, Crown, RefreshCw, Locate, Grid3X3, Map, Wifi, WifiOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Parking slot location (~200m from VIT Chennai)
const SLOT_LOCATION = { lat: 12.8410, lng: 80.1540 };

const createSlot = (status: ParkingSlot["status"] = "vacant"): ParkingSlot => ({
  id: "slot-1",
  label: "A1",
  status,
  lat: SLOT_LOCATION.lat,
  lng: SLOT_LOCATION.lng,
});

export default function Index() {
  const [slot, setSlot] = useState<ParkingSlot>(createSlot);
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showEspConfig, setShowEspConfig] = useState(false);
  const [espUrlInput, setEspUrlInput] = useState("http://192.168.1.100");
  const [espEnabled, setEspEnabled] = useState(false);

  const { location, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const { toast } = useToast();

  const {
    sensorStatus,
    isConnected: espConnected,
    error: espError,
    esp32Url,
    setEsp32Url,
  } = useESP32Sensor({ url: espUrlInput, enabled: espEnabled });

  // Update slot status based on ESP32 sensor data
  useEffect(() => {
    if (!espEnabled || !espConnected) return;
    // Don't override if user has reserved
    if (bookedSlotId === slot.id) return;

    setSlot((prev) => ({
      ...prev,
      status: sensorStatus === "occupied" ? "occupied" : "vacant",
    }));
  }, [sensorStatus, espConnected, espEnabled, bookedSlotId, slot.id]);

  const slots = [slot]; // Single slot array for components

  const handleBook = useCallback(
    (slotId: string) => {
      if (bookedSlotId) {
        toast({ title: "Already booked", description: "Cancel your current booking first.", variant: "destructive" });
        return;
      }

      if (slot.status !== "vacant") {
        toast({ title: "Slot unavailable", description: "This slot is currently occupied.", variant: "destructive" });
        return;
      }

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

      setSlot((prev) => ({ ...prev, status: "reserved", bookedBy: "user", expiresAt }));
      setBookedSlotId(slotId);
      toast({ title: "Slot booked!", description: `${slot.label} reserved for ${duration} minutes.` });
    },
    [bookedSlotId, slot, location, isPremium, toast]
  );

  const handleExpire = useCallback(() => {
    if (!bookedSlotId) return;
    setSlot((prev) => ({ ...prev, status: "vacant", bookedBy: undefined, expiresAt: undefined }));
    setBookedSlotId(null);
    toast({ title: "Booking expired", description: "Your reservation has timed out." });
  }, [bookedSlotId, toast]);

  const handleCancel = useCallback(() => {
    if (!bookedSlotId) return;
    setSlot((prev) => ({ ...prev, status: "vacant", bookedBy: undefined, expiresAt: undefined }));
    setBookedSlotId(null);
    toast({ title: "Booking cancelled" });
  }, [bookedSlotId, toast]);

  const bookedSlot = bookedSlotId ? slot : undefined;
  const vacantCount = slot.status === "vacant" ? 1 : 0;

  const handleSaveEspUrl = () => {
    setEsp32Url(espUrlInput);
    toast({ title: "ESP32 URL updated", description: `Now polling ${espUrlInput}` });
  };

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
              <span>Near VIT Chennai, Kelambakkam</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-mono text-primary">{vacantCount}</p>
            <p className="text-xs text-muted-foreground">spots free</p>
          </div>
        </div>

        {/* ESP32 Sensor Connection */}
        <div className="rounded-xl bg-secondary/50 border border-border px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {espEnabled && espConnected ? (
                <Wifi className="h-4 w-4 text-slot-vacant" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm text-secondary-foreground">
                {!espEnabled
                  ? "ESP32 sensor disconnected"
                  : espConnected
                  ? "ESP32 sensor connected"
                  : espError
                  ? `ESP32 error: ${espError}`
                  : "Connecting to ESP32..."}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEspConfig(!showEspConfig)}
                className="h-8 w-8 p-0"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Switch
                checked={espEnabled}
                onCheckedChange={setEspEnabled}
              />
            </div>
          </div>
          {showEspConfig && (
            <div className="flex gap-2">
              <Input
                placeholder="ESP32 IP (e.g. http://192.168.1.100)"
                value={espUrlInput}
                onChange={(e) => setEspUrlInput(e.target.value)}
                className="text-sm h-9"
              />
              <Button size="sm" onClick={handleSaveEspUrl} className="h-9">
                Save
              </Button>
            </div>
          )}
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
            userLocation={location}
          />
        )}

        {/* Legend */}
        <StatusLegend />

        {/* View Toggle */}
        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="grid" className="flex-1 gap-2">
              <Grid3X3 className="h-4 w-4" /> Grid
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1 gap-2">
              <Map className="h-4 w-4" /> Map
            </TabsTrigger>
          </TabsList>
          <TabsContent value="grid">
            <div className="flex justify-center">
              <div className="w-32">
                <ParkingSlotCard
                  slot={slot}
                  onBook={handleBook}
                  disabled={!!bookedSlotId || !location}
                  isUserSlot={slot.id === bookedSlotId}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="map">
            <ParkingMap
              slots={slots}
              userLocation={location}
              bookedSlotId={bookedSlotId}
              onBook={handleBook}
              disabled={!!bookedSlotId || !location}
            />
          </TabsContent>
        </Tabs>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          {isPremium ? "Premium: 15-min reservation" : "Standard: 5-min reservation"} • Must be within 500m to book
        </p>
      </main>
    </div>
  );
}
