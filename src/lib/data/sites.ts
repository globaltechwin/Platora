export interface Site {
  id: string;
  name: string;
  code: string;
  zoning: string;
  status: "Active" | "Inactive";
  city: string;
  state: string;
  area: number;
  areaUnit: string;
  rera: string;
  totalPlots: number;
  availablePlots: number;
  bookedPlots: number;
  soldPlots: number;
}

export const mockSites: Site[] = [
  {
    id: "1",
    name: "ALAPAKKAM",
    code: "SITE-001",
    zoning: "Residential",
    status: "Active",
    city: "CHENNAI",
    state: "TAMILNADU",
    area: 2.0,
    areaUnit: "Acres",
    rera: "RERA-001",
    totalPlots: 20,
    availablePlots: 16,
    bookedPlots: 3,
    soldPlots: 0,
  },
  {
    id: "2",
    name: "Trichy",
    code: "SITE-003",
    zoning: "Residential",
    status: "Active",
    city: "Trichy",
    state: "TAMIL NADU",
    area: 5.0,
    areaUnit: "Acres",
    rera: "RERA-003",
    totalPlots: 15,
    availablePlots: 13,
    bookedPlots: 0,
    soldPlots: 0,
  },
  {
    id: "3",
    name: "VANDALUR",
    code: "SITE-002",
    zoning: "Residential",
    status: "Active",
    city: "CHENNAI",
    state: "TAMILNADU",
    area: 1.0,
    areaUnit: "Acres",
    rera: "RERA-002",
    totalPlots: 20,
    availablePlots: 20,
    bookedPlots: 0,
    soldPlots: 0,
  },
];
