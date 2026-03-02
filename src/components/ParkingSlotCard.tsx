import { ParkingSlot } from "@/types/parking";
import { Car, MapPin, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  slot: ParkingSlot;
  onBook: (id: string) => void;
  disabled: boolean;
  isUserSlot: boolean;
}

const statusConfig = {
  vacant: {
    bg: "bg-slot-vacant/10 border-slot-vacant/40 hover:border-slot-vacant",
    icon: "text-slot-vacant",
    label: "Vacant",
    shadow: "shadow-[0_0_20px_-4px_hsl(var(--slot-vacant-glow))]",
  },
  occupied: {
    bg: "bg-slot-occupied/10 border-slot-occupied/40",
    icon: "text-slot-occupied",
    label: "Occupied",
    shadow: "shadow-[0_0_20px_-4px_hsl(var(--slot-occupied-glow))]",
  },
  reserved: {
    bg: "bg-slot-reserved/10 border-slot-reserved/40",
    icon: "text-slot-reserved",
    label: "Reserved",
    shadow: "shadow-[0_0_20px_-4px_hsl(var(--slot-reserved-glow))]",
  },
};

export default function ParkingSlotCard({ slot, onBook, disabled, isUserSlot }: Props) {
  const config = statusConfig[slot.status];

  return (
    <button
      onClick={() => slot.status === "vacant" && onBook(slot.id)}
      disabled={slot.status !== "vacant" || disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-300 aspect-square",
        config.bg,
        config.shadow,
        slot.status === "vacant" && !disabled && "cursor-pointer hover:scale-105 active:scale-95",
        (slot.status !== "vacant" || disabled) && "cursor-not-allowed opacity-70",
        isUserSlot && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className={cn("transition-colors", config.icon)}>
        {slot.status === "occupied" ? (
          <Lock className="h-7 w-7" />
        ) : slot.status === "reserved" ? (
          <Car className="h-7 w-7" />
        ) : (
          <MapPin className="h-7 w-7" />
        )}
      </div>
      <span className="text-sm font-semibold text-foreground">{slot.label}</span>
      <span className={cn("text-xs font-mono font-medium", config.icon)}>
        {config.label}
      </span>
      {isUserSlot && (
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
      )}
    </button>
  );
}
