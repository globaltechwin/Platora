export interface Receipt {
  id: string;
  receiptNo: string;
  date: string;
  bookingNo: string;
  customer: string;
  sitePlot: string;
  mode: string;
  ref: string;
  amount: number;
  postedBy: string;
  status: "Approved" | "Pending" | "Rejected";
}

export const mockReceipts: Receipt[] = [];
