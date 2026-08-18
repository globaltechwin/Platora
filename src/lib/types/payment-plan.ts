export interface InstallmentRow {
  id: string;
  name: string;
  paymentPercent: number;
  dueDays: number;
  mandatory: boolean;
  orderIndex?: number;
}

export interface PaymentPlan {
  id: string;
  name: string;
  type: "Full Payment" | "Installment";
  status: "Active" | "Inactive";
  site: string;
  siteId: number | null;
  discount: number;
  installments: InstallmentRow[];
  createdOn: string;
}
