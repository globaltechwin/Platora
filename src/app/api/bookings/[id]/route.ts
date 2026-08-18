import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cancelBooking } from "@/lib/db/validators";
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: bookingInclude,
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(mapBooking(booking));
  } catch (error) {
    console.error("Failed to fetch booking:", error);
    return NextResponse.json(
      { error: "Failed to fetch booking" },
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
    const body = await request.json();

    if (body.status === "Cancelled") {
      await cancelBooking(parseInt(id));

      const booking = await prisma.booking.findUnique({
        where: { id: parseInt(id) },
        include: bookingInclude,
      });

      return NextResponse.json(mapBooking(booking!));
    }

    return NextResponse.json(
      { error: "Only cancellation is supported" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update booking";
    console.error("Failed to update booking:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await cancelBooking(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete booking";
    console.error("Failed to delete booking:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
