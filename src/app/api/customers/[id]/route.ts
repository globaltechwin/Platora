import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toLeadStage, toDBLeadStage } from "@/lib/types/customer";
import type { Customer } from "@/lib/types/customer";

const agentInclude = { referredByAgent: { select: { name: true } } };

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: agentInclude,
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(mapCustomer(customer));
  } catch (error) {
    console.error("Failed to fetch customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

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

    let agentId: number | null = existing.referredByAgentId;
    if (referredByAgent !== undefined) {
      if (referredByAgent) {
        const agent = await prisma.agent.findFirst({
          where: { name: referredByAgent },
          select: { id: true },
        });
        agentId = agent?.id ?? null;
      } else {
        agentId = null;
      }
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: {
        name: fullName?.trim() || existing.name,
        mobile: mobile?.trim() || existing.mobile,
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
        leadStage: leadStage ? toDBLeadStage(leadStage) as "Lead" | "Contacted" | "SiteVisit" | "Negotiation" | "Booked" | "Lost" : undefined,
        referredByAgentId: agentId,
        interestedIn: interestedIn?.trim() || null,
        notesRemarks: notesRemarks?.trim() || null,
      },
    });

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: agentInclude,
    });

    return NextResponse.json(mapCustomer(customer!));
  } catch (error) {
    console.error("Failed to update customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID" }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const bookingCount = await prisma.booking.count({
      where: { customerId },
    });
    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete customer "${customer.name}" because they have ${bookingCount} booking(s). Remove or cancel those bookings first.`,
        },
        { status: 409 },
      );
    }

    await prisma.customer.delete({ where: { id: customerId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
