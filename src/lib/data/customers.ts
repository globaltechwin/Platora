export type LeadStage = "New Lead" | "Contacted" | "Site Visit" | "Negotiation" | "Booked" | "Lost";

export interface Customer {
  id: string;
  code: string;
  name: string;
  mobile: string;
  email: string;
  leadSource: string;
  stage: LeadStage;
  agent: string;
  registeredOn: string;
}

export const mockCustomers: Customer[] = [
  {
    id: "1",
    code: "C20260003",
    name: "Rajesh",
    mobile: "9999999999",
    email: "",
    leadSource: "",
    stage: "Booked",
    agent: "",
    registeredOn: "18/06/2026",
  },
  {
    id: "2",
    code: "C20260002",
    name: "Pradeep",
    mobile: "9962614094",
    email: "",
    leadSource: "Walk-In",
    stage: "Booked",
    agent: "",
    registeredOn: "05/06/2026",
  },
  {
    id: "3",
    code: "C20260001",
    name: "Raja",
    mobile: "9944418662",
    email: "",
    leadSource: "Online",
    stage: "Booked",
    agent: "",
    registeredOn: "30/05/2026",
  },
];
