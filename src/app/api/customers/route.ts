import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateCustomerCode } from "@/lib/db/validators";
import { toLeadStage } from "@/lib/types/customer";
import type { Customer } from "@/lib/types/customer";

function mapCustomer(c: {
  id: number;
  code: string;
  name: string;
  mobile: string;
  alternateMobile: string | null;
  email: string | null;
  dateOfBirth: Date | null;
  occupation: string | null;
  panNumber: string | null;
  aadhaarNumber: string | null;
  passportNo: string | null;
  addressLine: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  coApplicantName: string | null;
  coApplicantPan: string | null;
  coApplicantAadhaar: string | null;
  leadSource: string | null;
  leadStage: string;
  referredByAgentId: number | null;
  referredByAgent: { name: string } | null;
  interestedIn: string | null;
  notesRemarks: string | null;
  createdAt: Date;
}): Customer {
  return {
    id: String(c.id),
    code: c.code,
    name: c.name,
    mobile: c.mobile,
    alternateMobile: c.alternateMobile ?? "",
    email: c.email ?? "",
    dateOfBirth: c.dateOfBirth?.toISOString().split("T")[0] ?? "",
    occupation: c.occupation ?? "",
    panNumber: c.panNumber ?? "",
    aadhaarNumber: c.aadhaarNumber ?? "",
    passportNo: c.passportNo ?? "",
    addressLine: c.addressLine ?? "",
    city: c.city ?? "",
    state: c.state ?? "",
    pincode: c.pincode ?? "",
    coApplicantName: c.coApplicantName ?? "",
    coApplicantPan: c.coApplicantPan ?? "",
    coApplicantAadhaar: c.coApplicantAadhaar ?? "",
    leadSource: c.leadSource ?? "",
    stage: toLeadStage(c.leadStage),
    referredByAgentId: c.referredByAgentId,
    referredByAgentName: c.referredByAgent?.name ?? null,
    interestedIn: c.interestedIn ?? "",
    notesRemarks: c.notesRemarks ?? "",
    registeredOn: c.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}

const agentInclude = { referredByAgent: { select: { name: true } } };

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      include: agentInclude,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(customers.map(mapCustomer));
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      mobile,
      alternateMobile,
      email,
      dateOfBirth,
      occupation,
      panNumber,
      aadhaarNumber,
      passportNo,
      addressLine,
      city,
      state,
      pincode,
      coApplicantName,
      coApplicantPan,
      coApplicantAadhaar,
      leadSource,
      leadStage,
      referredByAgent,
      interestedIn,
      notesRemarks,
    } = body;

    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: "Full name is required" },
        { status: 400 },
      );
    }
    if (!mobile?.trim()) {
      return NextResponse.json(
        { error: "Mobile is required" },
        { status: 400 },
      );
    }

    const code = await generateCustomerCode();

    // Resolve agent ID from name
    let agentId: number | null = null;
    if (referredByAgent) {
      const agent = await prisma.agent.findFirst({
        where: { name: referredByAgent },
        select: { id: true },
      });
      agentId = agent?.id ?? null;
    }

    const customer = await prisma.customer.create({
      data: {
        code,
        name: fullName.trim(),
        mobile: mobile.trim(),
        alternateMobile: alternateMobile?.trim() || null,
        email: email?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        occupation: occupation?.trim() || null,
        panNumber: panNumber?.trim() || null,
        aadhaarNumber: aadhaarNumber?.trim() || null,
        passportNo: passportNo?.trim() || null,
        addressLine: addressLine?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        pincode: pincode?.trim() || null,
        coApplicantName: coApplicantName?.trim() || null,
        coApplicantPan: coApplicantPan?.trim() || null,
        coApplicantAadhaar: coApplicantAadhaar?.trim() || null,
        leadSource: leadSource?.trim() || null,
        leadStage: leadStage || "Lead",
        referredByAgentId: agentId,
        interestedIn: interestedIn?.trim() || null,
        notesRemarks: notesRemarks?.trim() || null,
      },
      include: agentInclude,
    });

    return NextResponse.json(mapCustomer(customer), { status: 201 });
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 },
    );
  }
}
