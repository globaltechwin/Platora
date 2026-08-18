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
