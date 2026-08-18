export interface InstallmentRow {
  id: string;
  name: string;
  paymentPercent: number;
  dueDays: number;
  mandatory: boolean;
}

export interface PaymentPlan {
  id: string;
  name: string;
  type: "Full Payment" | "Installment";
  status: "Active" | "Inactive";
  site: string;
  discount: number;
  installments: InstallmentRow[];
  createdOn: string;
}

export const mockPaymentPlans: PaymentPlan[] = [
  {
    id: "1",
    name: "Full Payment",
    type: "Full Payment",
    status: "Active",
    site: "All Sites",
    discount: 0,
    installments: [],
    createdOn: "09/06/2026",
  },
  {
    id: "2",
    name: "Installment",
    type: "Installment",
    status: "Inactive",
    site: "All Sites",
    discount: 0,
    installments: [
      { id: "r1", name: "Down Payment", paymentPercent: 25, dueDays: 0, mandatory: true },
      { id: "r2", name: "2nd Installment", paymentPercent: 25, dueDays: 30, mandatory: true },
      { id: "r3", name: "3rd Installment", paymentPercent: 25, dueDays: 60, mandatory: true },
      { id: "r4", name: "Final Payment", paymentPercent: 25, dueDays: 90, mandatory: true },
    ],
    createdOn: "09/06/2026",
  },
];
