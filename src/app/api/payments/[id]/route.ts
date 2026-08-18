import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Payment } from "@/lib/types/payment";

function mapPayment(p: {
  id: number;
  receiptNo: string;
  date: Date;
  mode: string;
  ref: string | null;
  amount: { toNumber: () => number };
  postedBy: string | null;
  status: string;
  booking: {
    bookingNo: string;
    customerId: number;
    customer: { name: string };
    plot: { code: string; site: { name: string } };
  };
}): Payment {
  return {
    id: p.id,
    receiptNo: p.receiptNo,
    date: p.date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    bookingId: p.booking.customerId,
    bookingNo: p.booking.bookingNo,
    customerId: p.booking.customerId,
    customerName: p.booking.customer.name,
    siteName: p.booking.plot.site.name,
    plotCode: p.booking.plot.code,
    mode: p.mode,
    ref: p.ref ?? "",
    amount: p.amount.toNumber(),
    postedBy: p.postedBy ?? "",
    status: p.status as "Approved" | "Pending" | "Rejected",
  };
}

const paymentInclude = {
  booking: {
    select: {
      bookingNo: true,
      customerId: true,
      customer: { select: { name: true } },
      plot: { select: { code: true, site: { select: { name: true } } } },
    },
  },
} as const;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: paymentInclude,
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(mapPayment(payment));
  } catch (error) {
    console.error("Failed to fetch payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
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

    const existing = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }

    if (body.status && ["Approved", "Pending", "Rejected"].includes(body.status)) {
      const updated = await prisma.payment.update({
        where: { id: parseInt(id) },
        data: { status: body.status },
        include: paymentInclude,
      });
      return NextResponse.json(mapPayment(updated));
    }

    return NextResponse.json(
      { error: "Invalid status value" },
      { status: 400 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update payment";
    console.error("Failed to update payment:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 },
      );
    }

    await prisma.payment.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete payment";
    console.error("Failed to delete payment:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
