export interface Payment {
  id: number;
  receiptNo: string;
  date: string;
  bookingId: number;
  bookingNo: string;
  customerId: number;
  customerName: string;
  siteName: string;
  plotCode: string;
  mode: string;
  ref: string;
  amount: number;
  postedBy: string;
  status: "Approved" | "Pending" | "Rejected";
}
