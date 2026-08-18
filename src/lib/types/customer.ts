export type LeadStage =
  | "New Lead"
  | "Contacted"
  | "Site Visit"
  | "Negotiation"
  | "Booked"
  | "Lost";

export interface Customer {
  id: string;
  code: string;
  name: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  dateOfBirth: string;
  occupation: string;
  panNumber: string;
  aadhaarNumber: string;
  passportNo: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  coApplicantName: string;
  coApplicantPan: string;
  coApplicantAadhaar: string;
  leadSource: string;
  stage: LeadStage;
  referredByAgentId: number | null;
  referredByAgentName: string | null;
  interestedIn: string;
  notesRemarks: string;
  registeredOn: string;
}

export function toLeadStage(dbStage: string): LeadStage {
  const map: Record<string, LeadStage> = {
    Lead: "New Lead",
    Contacted: "Contacted",
    SiteVisit: "Site Visit",
    Negotiation: "Negotiation",
    Booked: "Booked",
    Lost: "Lost",
  };
  return map[dbStage] ?? "New Lead";
}

export function toDBLeadStage(uiStage: string): string {
  const map: Record<string, string> = {
    "New Lead": "Lead",
    Contacted: "Contacted",
    "Site Visit": "SiteVisit",
    Negotiation: "Negotiation",
    Booked: "Booked",
    Lost: "Lost",
  };
  return map[uiStage] ?? "Lead";
}
