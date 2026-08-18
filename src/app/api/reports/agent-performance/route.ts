import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface AgentPerformanceRow {
  id: number;
  agentCode: string;
  agentName: string;
  bookings: number;
  value: number;
  commission: number;
  pendingCommission: number;
}

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        bookings: {
          where: { status: "Confirmed" },
          include: {
            plot: { select: { area: true } },
            payments: { where: { status: "Approved" }, select: { amount: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const rows: AgentPerformanceRow[] = agents.map((agent) => {
      let totalValue = 0;
      let totalCommission = 0;
      let totalApprovedPayments = 0;

      for (const booking of agent.bookings) {
        const bookingTotal = booking.total.toNumber();
        const plotArea = booking.plot.area.toNumber();
        const agentCommissionRate = agent.commission.toNumber();

        totalValue += bookingTotal;
        totalCommission += plotArea > 0 ? (bookingTotal * agentCommissionRate) / plotArea : 0;

        for (const payment of booking.payments) {
          totalApprovedPayments += payment.amount.toNumber();
        }
      }

      const pendingCommission = totalCommission - totalApprovedPayments;

      return {
        id: agent.id,
        agentCode: agent.code,
        agentName: agent.name,
        bookings: agent.bookings.length,
        value: totalValue,
        commission: totalCommission,
        pendingCommission,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch agent performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent performance" },
      { status: 500 },
    );
  }
}
