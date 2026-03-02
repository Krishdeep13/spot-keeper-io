export type SlotStatus = "vacant" | "occupied" | "reserved";

export interface ParkingSlot {
  id: string;
  label: string;
  status: SlotStatus;
  lat: number;
  lng: number;
  bookedBy?: string;
  expiresAt?: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
}
