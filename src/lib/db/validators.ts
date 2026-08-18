import { prisma } from ".";
import { Prisma } from "@prisma/client";

// ─── BOOKING NUMBER GENERATION ─────────────────────────────────────

export async function generateBookingNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `BK${year}`;

  const lastBooking = await prisma.booking.findFirst({
    where: { bookingNo: { startsWith: prefix } },
    orderBy: { bookingNo: "desc" },
    select: { bookingNo: true },
  });

  if (!lastBooking) {
    return `${prefix}0001`;
  }

  const lastSeq = parseInt(lastBooking.bookingNo.slice(-4), 10);
  const nextSeq = lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ─── CUSTOMER CODE GENERATION ──────────────────────────────────────

export async function generateCustomerCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `C${year}`;

  const lastCustomer = await prisma.customer.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  if (!lastCustomer) {
    return `${prefix}0001`;
  }

  const lastSeq = parseInt(lastCustomer.code.slice(-4), 10);
  const nextSeq = lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ─── AGENT CODE GENERATION ─────────────────────────────────────────

export async function generateAgentCode(): Promise<string> {
  const prefix = "AGT";

  const lastAgent = await prisma.agent.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  if (!lastAgent) {
    return `${prefix}1001`;
  }

  const lastSeq = parseInt(lastAgent.code.slice(-4), 10);
  const nextSeq = lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ─── RECEIPT NUMBER GENERATION ─────────────────────────────────────

export async function generateReceiptNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RCT${year}`;

  const lastPayment = await prisma.payment.findFirst({
    where: { receiptNo: { startsWith: prefix } },
    orderBy: { receiptNo: "desc" },
    select: { receiptNo: true },
  });

  if (!lastPayment) {
    return `${prefix}0001`;
  }

  const lastSeq = parseInt(lastPayment.receiptNo.slice(-4), 10);
  const nextSeq = lastSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

// ─── PAYMENT PLAN VALIDATION ───────────────────────────────────────

export function validatePlanInstallments(
  installments: { paymentPercent: number }[],
): { valid: boolean; total: number; error?: string } {
  const total = installments.reduce(
    (sum, inst) => sum + inst.paymentPercent,
    0,
  );
  const valid = Math.abs(total - 100) < 0.01;
  return {
    valid,
    total,
    error: valid
      ? undefined
      : `Installment percentages must total 100%. Current total: ${total.toFixed(2)}%`,
  };
}

// ─── BOOKING CREATION (with one-confirmed-per-plot validation) ─────

export interface CreateBookingInput {
  plotId: number;
  customerId: number;
  agentId?: number;
  paymentPlanId?: number;
  total: Prisma.Decimal | number;
  advance: Prisma.Decimal | number;
  date: Date;
}

/**
 * Creates a booking inside a transaction.
 * Validates that the plot has no existing Confirmed booking.
 * Returns the created booking or throws an error.
 */
export async function createBookingWithValidation(input: CreateBookingInput) {
  return prisma.$transaction(async (tx) => {
    // Check for existing confirmed booking on this plot
    const existingConfirmed = await tx.booking.findFirst({
      where: {
        plotId: input.plotId,
        status: "Confirmed",
      },
      select: { id: true, bookingNo: true },
    });

    if (existingConfirmed) {
      throw new Error(
        `Plot already has an active booking (${existingConfirmed.bookingNo}). ` +
          `Cancel the existing booking before creating a new one.`,
      );
    }

    // Verify plot is available
    const plot = await tx.plot.findUniqueOrThrow({
      where: { id: input.plotId },
      select: { status: true, code: true },
    });

    if (plot.status !== "Available") {
      throw new Error(
        `Plot ${plot.code} is not available (status: ${plot.status}).`,
      );
    }

    // Generate booking number
    const year = new Date().getFullYear();
    const prefix = `BK${year}`;
    const lastBooking = await tx.booking.findFirst({
      where: { bookingNo: { startsWith: prefix } },
      orderBy: { bookingNo: "desc" },
      select: { bookingNo: true },
    });
    const nextSeq = lastBooking
      ? parseInt(lastBooking.bookingNo.slice(-4), 10) + 1
      : 1;
    const bookingNo = `${prefix}${String(nextSeq).padStart(4, "0")}`;

    // Create booking
    const booking = await tx.booking.create({
      data: {
        bookingNo,
        date: input.date,
        plotId: input.plotId,
        customerId: input.customerId,
        agentId: input.agentId ?? null,
        paymentPlanId: input.paymentPlanId ?? null,
        total: input.total,
        advance: input.advance,
        status: "Confirmed",
      },
    });

    // Update plot status to Booked
    await tx.plot.update({
      where: { id: input.plotId },
      data: { status: "Booked" },
    });

    return booking;
  });
}

// ─── BOOKING CANCELLATION ──────────────────────────────────────────

export async function cancelBooking(bookingId: number) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
      select: { id: true, plotId: true, status: true },
    });

    if (booking.status === "Cancelled") {
      throw new Error("Booking is already cancelled.");
    }

    // Cancel booking
    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "Cancelled" },
    });

    // Check if plot has any other confirmed bookings
    const otherConfirmed = await tx.booking.findFirst({
      where: {
        plotId: booking.plotId,
        status: "Confirmed",
        id: { not: bookingId },
      },
      select: { id: true },
    });

    // Only set plot back to Available if no other confirmed bookings exist
    if (!otherConfirmed) {
      await tx.plot.update({
        where: { id: booking.plotId },
        data: { status: "Available" },
      });
    }

    return updated;
  });
}

// ─── SITE PLOT COUNTS ──────────────────────────────────────────────

export async function getSitePlotCounts(siteId: number) {
  const plots = await prisma.plot.groupBy({
    by: ["status"],
    where: { siteId },
    _count: { id: true },
  });

  const counts = {
    total: 0,
    available: 0,
    blocked: 0,
    booked: 0,
    sold: 0,
  };

  for (const row of plots) {
    counts.total += row._count.id;
    switch (row.status) {
      case "Available":
        counts.available = row._count.id;
        break;
      case "Blocked":
      case "BlockedAdmin":
        counts.blocked += row._count.id;
        break;
      case "Booked":
      case "Registered":
        counts.booked += row._count.id;
        break;
      case "Sold":
        counts.sold = row._count.id;
        break;
    }
  }

  return counts;
}
