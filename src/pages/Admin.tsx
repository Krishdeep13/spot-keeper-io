import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, LogOut, Phone, Mail, MapPin, Shield, Circle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MANAGER_INFO = {
  name: "Rajesh Kumar",
  phone: "+91 98765 43210",
  email: "rajesh.kumar@parksmart.in",
  location: "Parking Lot A, Near VIT Chennai, Kelambakkam",
  role: "Parking Manager",
};

const statusColor: Record<string, string> = {
  vacant: "text-slot-vacant",
  occupied: "text-slot-occupied",
  reserved: "text-slot-reserved",
};

const statusBg: Record<string, string> = {
  vacant: "bg-slot-vacant/15",
  occupied: "bg-slot-occupied/15",
  reserved: "bg-slot-reserved/15",
};

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const r = localStorage.getItem("parksmartRole");
    if (r !== "admin") {
      toast({ title: "Access denied", description: "Admin login required.", variant: "destructive" });
      navigate("/login");
      return;
    }
    setRole(r);
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem("parksmartRole");
    localStorage.removeItem("parksmartUser");
    toast({ title: "Logged out" });
    navigate("/login");
  };

  if (role !== "admin") return null;

  // Current slot status — in a real app this would come from a shared store/db
  const slotStatus = "vacant"; // placeholder; you could lift state or use context

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
              <h1 className="text-lg font-bold text-foreground tracking-tight">ParkSmart Admin</h1>
              <p className="text-xs text-muted-foreground">Management Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        {/* Slot Status Card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Slot Overview
          </h2>
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${statusBg[slotStatus]}`}>
            <Circle className={`h-5 w-5 fill-current ${statusColor[slotStatus]}`} />
            <div>
              <p className="text-sm font-semibold text-foreground">Slot A1</p>
              <p className={`text-xs font-medium capitalize ${statusColor[slotStatus]}`}>{slotStatus}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Slot status updates in real-time via ESP32 sensor. If occupied, the sensor detects a vehicle.
          </p>
        </div>

        {/* Manager Contact Card */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Parking Manager
          </h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{MANAGER_INFO.name}</p>
                <p className="text-xs text-muted-foreground">{MANAGER_INFO.role}</p>
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-secondary/50 p-4">
              <a href={`tel:${MANAGER_INFO.phone}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-muted-foreground" />
                {MANAGER_INFO.phone}
              </a>
              <a href={`mailto:${MANAGER_INFO.email}`} className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {MANAGER_INFO.email}
              </a>
              <div className="flex items-start gap-3 text-sm text-foreground">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                {MANAGER_INFO.location}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 flex-col gap-1" onClick={() => navigate("/")}>
              <Car className="h-5 w-5" />
              <span className="text-xs">View Parking</span>
            </Button>
            <a href={`tel:${MANAGER_INFO.phone}`}>
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1">
                <Phone className="h-5 w-5" />
                <span className="text-xs">Call Manager</span>
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
