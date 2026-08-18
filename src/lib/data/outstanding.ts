export interface OutstandingInstallment {
  id: string;
  bookingNo: string;
  customer: string;
  mobile: string;
  sitePlot: string;
  installment: string;
  dueDate: string;
  due: number;
  paid: number;
  balance: number;
  overdueDays: number;
  status: "Pending" | "Overdue" | "Paid";
}

export const mockOutstanding: OutstandingInstallment[] = [];
