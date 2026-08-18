import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createBookingWithValidation,
} from "@/lib/db/validators";
import type { Booking } from "@/lib/types/booking";

function mapBooking(b: {
  id: number;
  bookingNo: string;
  date: Date;
  total: { toNumber: () => number };
  advance: { toNumber: () => number };
  status: string;
  plot: { id: number; code: string; site: { id: number; name: string } };
  customer: { id: number; name: string; mobile: string };
  agent: { id: number; name: string } | null;
  paymentPlan: { id: number; name: string } | null;
  payments: { amount: { toNumber: () => number } }[];
}): Booking {
  const advance = b.advance.toNumber();
  const paymentSum = b.payments.reduce(
    (sum, p) => sum + p.amount.toNumber(),
    0,
  );
  const paid = advance + paymentSum;
  const total = b.total.toNumber();
  const balance = total - paid;

  return {
    id: b.id,
    bookingNo: b.bookingNo,
    date: b.date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    siteId: b.plot.site.id,
    siteName: b.plot.site.name,
    plotId: b.plot.id,
    plotCode: b.plot.code,
    customerId: b.customer.id,
    customerName: b.customer.name,
    mobile: b.customer.mobile,
    agentId: b.agent?.id ?? null,
    agentName: b.agent?.name ?? "-",
    paymentPlanId: b.paymentPlan?.id ?? null,
    paymentPlanName: b.paymentPlan?.name ?? "-",
    total,
    paid,
    balance,
    advance,
    status: b.status === "Confirmed" ? "Confirmed" : "Cancelled",
  };
}

const bookingInclude = {
  plot: { include: { site: { select: { id: true, name: true } } } },
  customer: { select: { id: true, name: true, mobile: true } },
  agent: { select: { id: true, name: true } },
  paymentPlan: { select: { id: true, name: true } },
  payments: { select: { amount: true } },
} as const;

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: bookingInclude,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(bookings.map(mapBooking));
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      plotId,
      customerId,
      agentId,
      paymentPlanId,
      total,
      advance,
      date,
    } = body;

    if (!plotId) {
      return NextResponse.json(
        { error: "Plot is required" },
        { status: 400 },
      );
    }
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer is required" },
        { status: 400 },
      );
    }
    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Total amount must be greater than 0" },
        { status: 400 },
      );
    }
    if (advance && advance > total) {
      return NextResponse.json(
        { error: "Advance cannot exceed total" },
        { status: 400 },
      );
    }

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 400 });
    }

    // Validate agent if supplied
    if (agentId) {
      const agent = await prisma.agent.findUnique({
        where: { id: agentId },
        select: { id: true },
      });
      if (!agent) {
        return NextResponse.json({ error: "Agent not found" }, { status: 400 });
      }
    }

    // Validate payment plan if supplied
    if (paymentPlanId) {
      const plan = await prisma.paymentPlan.findUnique({
        where: { id: paymentPlanId },
        select: { id: true },
      });
      if (!plan) {
        return NextResponse.json(
          { error: "Payment plan not found" },
          { status: 400 },
        );
      }
    }

    const booking = await createBookingWithValidation({
      plotId,
      customerId,
      agentId: agentId || undefined,
      paymentPlanId: paymentPlanId || undefined,
      total,
      advance: advance || 0,
      date: date ? new Date(date) : new Date(),
    });

    // Create installment schedule if payment plan is Installment
    if (paymentPlanId) {
      const plan = await prisma.paymentPlan.findUnique({
        where: { id: paymentPlanId },
        select: { type: true },
      });

      if (plan?.type === "Installment") {
        const installments = await prisma.planInstallment.findMany({
          where: { planId: paymentPlanId },
          orderBy: { orderIndex: "asc" },
        });

        if (installments.length > 0) {
          const bookingDate = date ? new Date(date) : new Date();
          const bookingTotal = total;

          await prisma.installmentSchedule.createMany({
            data: installments.map((inst, idx) => ({
              bookingId: booking.id,
              installmentName: inst.name,
              dueDate: new Date(
                bookingDate.getTime() + inst.dueDays * 24 * 60 * 60 * 1000,
              ),
              due: (bookingTotal * inst.paymentPercent.toNumber()) / 100,
              paid: 0,
              status: "Pending" as const,
              orderIndex: idx,
            })),
          });
        }
      }
    }

    // Return the full booking with relations
    const fullBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: bookingInclude,
    });

    return NextResponse.json(mapBooking(fullBooking!), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create booking";
    console.error("Failed to create booking:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
