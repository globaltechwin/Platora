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
  siteId: string;
  siteName: string;
  dimensions?: string;
  price?: number;
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

export const mockPlots: Plot[] = [
  // Block A - ALAPAKKAM
  { id: "a1", code: "A1", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "North", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a2", code: "A2", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "North", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a3", code: "A3", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "East", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a4", code: "A4", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "East", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a5", code: "A5", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Booked", facing: "South", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a6", code: "A6", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "South", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a7", code: "A7", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Booked", facing: "West", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a8", code: "A8", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Booked", facing: "West", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a9", code: "A9", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "North", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "a10", code: "A10", block: "A", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "North", siteId: "1", siteName: "ALAPAKKAM" },
  // Block B - ALAPAKKAM
  { id: "b1", code: "B1", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "South", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b2", code: "B2", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "South", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b3", code: "B3", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "East", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b4", code: "B4", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "East", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b5", code: "B5", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "West", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b6", code: "B6", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "West", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b7", code: "B7", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "North", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b8", code: "B8", block: "B", area: 1213, areaUnit: "Sq.ft", status: "Available", facing: "North", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b9", code: "B9", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "South", siteId: "1", siteName: "ALAPAKKAM" },
  { id: "b10", code: "B10", block: "B", area: 133.33, areaUnit: "Sq.ft", status: "Available", facing: "South", siteId: "1", siteName: "ALAPAKKAM" },
];
