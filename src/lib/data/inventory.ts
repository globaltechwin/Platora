export type InventoryStatus = "Available" | "OnHold" | "Booked" | "Sold";

export interface InventoryPlot {
  id: string;
  site: string;
  block: string;
  plotNo: string;
  type: string;
  facing: string;
  area: number;
  ratePerSqft: number;
  value: number;
  status: InventoryStatus;
  customerName?: string;
}

export const mockInventory: InventoryPlot[] = [
  // ALAPAKKAM - Block A
  { id: "1", site: "ALAPAKKAM", block: "Block A", plotNo: "A1", type: "Corner", facing: "East", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "OnHold" },
  { id: "2", site: "ALAPAKKAM", block: "Block A", plotNo: "A10", type: "Corner", facing: "West", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Available" },
  { id: "3", site: "ALAPAKKAM", block: "Block A", plotNo: "A2", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Available" },
  { id: "4", site: "ALAPAKKAM", block: "Block A", plotNo: "A3", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Available" },
  { id: "5", site: "ALAPAKKAM", block: "Block A", plotNo: "A4", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Available" },
  { id: "6", site: "ALAPAKKAM", block: "Block A", plotNo: "A5", type: "Corner", facing: "East", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Booked", customerName: "Raja" },
  { id: "7", site: "ALAPAKKAM", block: "Block A", plotNo: "A6", type: "Corner", facing: "West", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Available" },
  { id: "8", site: "ALAPAKKAM", block: "Block A", plotNo: "A7", type: "Regular", facing: "West", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Booked", customerName: "Pradeep" },
  { id: "9", site: "ALAPAKKAM", block: "Block A", plotNo: "A8", type: "Regular", facing: "West", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Booked", customerName: "Raja" },
  { id: "10", site: "ALAPAKKAM", block: "Block A", plotNo: "A9", type: "Regular", facing: "West", area: 133.33, ratePerSqft: 7800, value: 1039974, status: "Available" },
  // ALAPAKKAM - Block B
  { id: "11", site: "ALAPAKKAM", block: "Block B", plotNo: "B1", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "12", site: "ALAPAKKAM", block: "Block B", plotNo: "B10", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "13", site: "ALAPAKKAM", block: "Block B", plotNo: "B2", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "14", site: "ALAPAKKAM", block: "Block B", plotNo: "B3", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "15", site: "ALAPAKKAM", block: "Block B", plotNo: "B4", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "16", site: "ALAPAKKAM", block: "Block B", plotNo: "B5", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "17", site: "ALAPAKKAM", block: "Block B", plotNo: "B6", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "18", site: "ALAPAKKAM", block: "Block B", plotNo: "B7", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  { id: "19", site: "ALAPAKKAM", block: "Block B", plotNo: "B8", type: "Road Facing", facing: "East", area: 1213, ratePerSqft: 2599, value: 3152587, status: "Available" },
  { id: "20", site: "ALAPAKKAM", block: "Block B", plotNo: "B9", type: "Road Facing", facing: "East", area: 133.33, ratePerSqft: 2500, value: 333325, status: "Available" },
  // Trichy
  { id: "21", site: "Trichy", block: "—", plotNo: "A001", type: "—", facing: "East", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "22", site: "Trichy", block: "—", plotNo: "A0010", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "23", site: "Trichy", block: "—", plotNo: "A0011", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "24", site: "Trichy", block: "—", plotNo: "A0012", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "25", site: "Trichy", block: "—", plotNo: "A0013", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "26", site: "Trichy", block: "—", plotNo: "A0014", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "27", site: "Trichy", block: "—", plotNo: "A0015", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "28", site: "Trichy", block: "—", plotNo: "A002", type: "—", facing: "North", area: 400, ratePerSqft: 2000, value: 800000, status: "OnHold" },
  { id: "29", site: "Trichy", block: "—", plotNo: "A003", type: "Park Facing", facing: "South", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "30", site: "Trichy", block: "—", plotNo: "A004", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "OnHold" },
  { id: "31", site: "Trichy", block: "—", plotNo: "A005", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "32", site: "Trichy", block: "—", plotNo: "A006", type: "Corner", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "33", site: "Trichy", block: "—", plotNo: "A007", type: "Road Facing", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "34", site: "Trichy", block: "—", plotNo: "A008", type: "—", facing: "South", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  { id: "35", site: "Trichy", block: "—", plotNo: "A009", type: "—", facing: "—", area: 400, ratePerSqft: 2000, value: 800000, status: "Available" },
  // VANDALUR
  { id: "36", site: "VANDALUR", block: "—", plotNo: "PLOT1", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "37", site: "VANDALUR", block: "—", plotNo: "PLOT10", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "38", site: "VANDALUR", block: "—", plotNo: "PLOT11", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "39", site: "VANDALUR", block: "—", plotNo: "PLOT12", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "40", site: "VANDALUR", block: "—", plotNo: "PLOT13", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "41", site: "VANDALUR", block: "—", plotNo: "PLOT14", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "42", site: "VANDALUR", block: "—", plotNo: "PLOT15", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "43", site: "VANDALUR", block: "—", plotNo: "PLOT16", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "44", site: "VANDALUR", block: "—", plotNo: "PLOT17", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "45", site: "VANDALUR", block: "—", plotNo: "PLOT18", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "46", site: "VANDALUR", block: "—", plotNo: "PLOT19", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "47", site: "VANDALUR", block: "—", plotNo: "PLOT2", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "48", site: "VANDALUR", block: "—", plotNo: "PLOT20", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "49", site: "VANDALUR", block: "—", plotNo: "PLOT3", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "50", site: "VANDALUR", block: "—", plotNo: "PLOT4", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "51", site: "VANDALUR", block: "—", plotNo: "PLOT5", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "52", site: "VANDALUR", block: "—", plotNo: "PLOT6", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "53", site: "VANDALUR", block: "—", plotNo: "PLOT7", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "54", site: "VANDALUR", block: "—", plotNo: "PLOT8", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
  { id: "55", site: "VANDALUR", block: "—", plotNo: "PLOT9", type: "Regular", facing: "South", area: 133.33, ratePerSqft: 5500, value: 733315, status: "Available" },
];
