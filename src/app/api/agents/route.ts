import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAgentCode } from "@/lib/db/validators";
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

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(agents.map(mapAgent));
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
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

    const code = agentCode?.trim() || (await generateAgentCode());

    // Check code uniqueness
    const existing = await prisma.agent.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: `Agent code "${code}" already exists` },
        { status: 409 },
      );
    }

    const agent = await prisma.agent.create({
      data: {
        code,
        name: fullName.trim(),
        mobile: mobile.trim(),
        email: email?.trim() || null,
        pan: panNumber?.trim() || null,
        reraNo: reraAgentNo?.trim() || null,
        bankName: bankName?.trim() || null,
        accountNo: accountNo?.trim() || null,
        ifscCode: ifscCode?.trim() || null,
        commission: commissionAmount || 0,
        status: status === "Inactive" ? "Inactive" : "Active",
      },
      include: { _count: { select: { bookings: true } } },
    });

    return NextResponse.json(mapAgent(agent), { status: 201 });
  } catch (error) {
    console.error("Failed to create agent:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 },
    );
  }
}
