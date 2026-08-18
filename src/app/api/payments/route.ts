import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateReceiptNo } from "@/lib/db/validators";
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

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: paymentInclude,
      orderBy: { date: "desc" },
    });
    return NextResponse.json(payments.map(mapPayment));
  } catch (error) {
    console.error("Failed to fetch payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, mode, ref, amount, postedBy, status } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking is required" },
        { status: 400 },
      );
    }
    if (!mode) {
      return NextResponse.json(
        { error: "Payment mode is required" },
        { status: 400 },
      );
    }
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Validate booking exists and is confirmed
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 400 },
      );
    }
    if (booking.status !== "Confirmed") {
      return NextResponse.json(
        { error: "Cannot record payment for a non-confirmed booking" },
        { status: 400 },
      );
    }

    const receiptNo = await generateReceiptNo();

    const payment = await prisma.payment.create({
      data: {
        receiptNo,
        bookingId,
        mode,
        ref: ref?.trim() || null,
        amount,
        postedBy: postedBy?.trim() || null,
        status: status || "Approved",
      },
      include: paymentInclude,
    });

    return NextResponse.json(mapPayment(payment), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create payment";
    console.error("Failed to create payment:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
