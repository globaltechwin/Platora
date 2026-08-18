export interface Site {
  id: number;
  code: string;
  name: string;
  status: "Active" | "Inactive";
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  area: number;
  areaUnit: string;
  zoning: string;
  rera: string | null;
  totalPlots: number;
  availablePlots: number;
  bookedPlots: number;
  soldPlots: number;
  createdAt: string;
  updatedAt: string;
}
