import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Agent } from "@/lib/types/agent";

function mapAgent(a: {
  id: number;
  code: string;
  name: string;
  mobile: string;
  email: string | null;
  pan: string | null;
  reraNo: string | null;
  bankName: string | null;
  accountNo: string | null;
  ifscCode: string | null;
  commission: { toNumber: () => number };
  status: string;
  joined: Date;
  _count?: { bookings: number };
}): Agent {
  return {
    id: String(a.id),
    code: a.code,
    name: a.name,
    mobile: a.mobile,
    email: a.email ?? "",
    pan: a.pan ?? "",
    reraNo: a.reraNo ?? "",
    bankName: a.bankName ?? "",
    accountNo: a.accountNo ?? "",
    ifscCode: a.ifscCode ?? "",
    commission: a.commission.toNumber(),
    bookings: a._count?.bookings ?? 0,
    status: a.status === "Inactive" ? "Inactive" : "Active",
    joined: a.joined.toLocaleDateString("en-GB", {
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
    const agentId = parseInt(id, 10);
    if (isNaN(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { _count: { select: { bookings: true } } },
    });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(mapAgent(agent));
  } catch (error) {
    console.error("Failed to fetch agent:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
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
    const agentId = parseInt(id, 10);
    if (isNaN(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
    }

    const existing = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!existing) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      fullName,
      mobile,
      email,
      panNumber,
      reraAgentNo,
      agentCode,
      bankName,
      accountNo,
      ifscCode,
      commissionAmount,
      status,
    } = body;

    // Check code uniqueness if changed
    const newCode = agentCode?.trim() || existing.code;
    if (newCode !== existing.code) {
      const codeTaken = await prisma.agent.findUnique({
        where: { code: newCode },
      });
      if (codeTaken) {
        return NextResponse.json(
          { error: `Agent code "${newCode}" already exists` },
          { status: 409 },
        );
      }
    }

    const agent = await prisma.agent.update({
      where: { id: agentId },
      data: {
        code: newCode,
        name: fullName?.trim() || existing.name,
        mobile: mobile?.trim() || existing.mobile,
        email: email?.trim() || null,
        pan: panNumber?.trim() || null,
        reraNo: reraAgentNo?.trim() || null,
        bankName: bankName?.trim() || null,
        accountNo: accountNo?.trim() || null,
        ifscCode: ifscCode?.trim() || null,
        commission: commissionAmount != null ? commissionAmount : undefined,
        status: status === "Inactive" ? "Inactive" : "Active",
      },
      include: { _count: { select: { bookings: true } } },
    });

    return NextResponse.json(mapAgent(agent));
  } catch (error) {
    console.error("Failed to update agent:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
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
    const agentId = parseInt(id, 10);
    if (isNaN(agentId)) {
      return NextResponse.json({ error: "Invalid agent ID" }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const bookingCount = await prisma.booking.count({
      where: { agentId },
    });
    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete agent "${agent.name}" because they have ${bookingCount} booking(s). Remove or reassign those bookings first.`,
        },
        { status: 409 },
      );
    }

    // Check for referred customers
    const referredCount = await prisma.customer.count({
      where: { referredByAgentId: agentId },
    });
    if (referredCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete agent "${agent.name}" because they are referenced by ${referredCount} customer(s). Remove the agent reference first.`,
        },
        { status: 409 },
      );
    }

    await prisma.agent.delete({ where: { id: agentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 },
    );
  }
}
