export interface Booking {
  id: number;
  bookingNo: string;
  date: string;
  siteName: string;
  siteId: number;
  plotId: number;
  plotCode: string;
  customerId: number;
  customerName: string;
  mobile: string;
  agentId: number | null;
  agentName: string;
  paymentPlanId: number | null;
  paymentPlanName: string;
  total: number;
  paid: number;
  balance: number;
  advance: number;
  status: "Confirmed" | "Cancelled";
}

export interface BookingSummary {
  total: number;
  paid: number;
  balance: number;
}
