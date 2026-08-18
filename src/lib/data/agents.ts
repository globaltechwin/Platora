export interface Agent {
  id: string;
  code: string;
  name: string;
  mobile: string;
  email: string;
  pan: string;
  reraNo: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  commission: number;
  bookings: number;
  status: "Active" | "Inactive";
  joined: string;
}

export const mockAgents: Agent[] = [
  {
    id: "1",
    code: "SIV0001",
    name: "Siva",
    mobile: "9999999999",
    email: "",
    pan: "",
    reraNo: "",
    bankName: "",
    accountNo: "",
    ifscCode: "",
    commission: 0,
    bookings: 3,
    status: "Active",
    joined: "09/06/2026",
  },
];
