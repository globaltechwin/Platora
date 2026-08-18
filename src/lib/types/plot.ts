export type PlotStatus =
  | "Available"
  | "Blocked"
  | "Booked"
  | "Registered"
  | "Sold"
  | "Blocked (Admin)";

export interface Plot {
  id: string;
  code: string;
  block: string;
  area: number;
  areaUnit: string;
  status: PlotStatus;
  facing: string;
  siteId: number;
  siteName: string;
  type?: string;
  dimensions?: string;
  ratePerSqft?: number;
  plcCharges?: number;
}

export const statusColors: Record<PlotStatus, string> = {
  Available: "bg-emerald-500",
  Blocked: "bg-orange-500",
  Booked: "bg-blue-500",
  Registered: "bg-purple-500",
  Sold: "bg-red-500",
  "Blocked (Admin)": "bg-gray-400",
};

export const statusBorderColors: Record<PlotStatus, string> = {
  Available: "border-emerald-600",
  Blocked: "border-orange-600",
  Booked: "border-blue-600",
  Registered: "border-purple-600",
  Sold: "border-red-600",
  "Blocked (Admin)": "border-gray-500",
};

// Map Prisma PlotStatus → UI PlotStatus
export function toUIStatus(dbStatus: string): PlotStatus {
  if (dbStatus === "BlockedAdmin") return "Blocked (Admin)";
  return dbStatus as PlotStatus;
}

// Map UI PlotStatus → Prisma PlotStatus
export function toDBStatus(uiStatus: string): string {
  if (uiStatus === "Blocked (Admin)") return "BlockedAdmin";
  return uiStatus;
}

// Map form type labels → Prisma PlotType values
export function toDBType(formType: string): string | null {
  if (!formType) return null;
  const map: Record<string, string> = {
    Regular: "Regular",
    Corner: "Corner",
    "Corner Road": "RoadFacing",
    "Park Facing": "ParkFacing",
  };
  return map[formType] ?? null;
}
