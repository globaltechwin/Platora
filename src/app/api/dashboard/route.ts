import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [sites, plots, bookings, payments] = await Promise.all([
      prisma.site.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.plot.findMany({
        select: { status: true, siteId: true, site: { select: { name: true } } },
      }),
      prisma.booking.findMany({
        include: {
          plot: { select: { code: true, site: { select: { name: true } } } },
          customer: { select: { name: true, mobile: true } },
          payments: { where: { status: "Approved" }, select: { amount: true } },
        },
        orderBy: { date: "desc" },
      }),
      prisma.payment.findMany({
        where: { status: "Approved" },
        select: { amount: true, bookingId: true },
      }),
    ]);

    const siteNames = sites.map((s) => s.name);

    const plotCounts = { total: 0, available: 0, blocked: 0, booked: 0, sold: 0 };
    for (const p of plots) {
      plotCounts.total++;
      switch (p.status) {
        case "Available": plotCounts.available++; break;
        case "Blocked":
        case "BlockedAdmin": plotCounts.blocked++; break;
        case "Booked":
        case "Registered": plotCounts.booked++; break;
        case "Sold": plotCounts.sold++; break;
      }
    }

    const mappedBookings = bookings.map((b) => {
      const advance = b.advance.toNumber();
      const paymentSum = b.payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
      const paid = advance + paymentSum;
      const total = b.total.toNumber();
      const balance = total - paid;

      return {
        id: b.id,
        bookingNo: b.bookingNo,
        date: b.date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
        siteName: b.plot.site.name,
        plotCode: b.plot.code,
        customerName: b.customer.name,
        mobile: b.customer.mobile,
        total,
        paid,
        balance,
        status: b.status,
      };
    });

    const totalCollection = payments.reduce((sum, p) => sum + p.amount.toNumber(), 0);
    const pendingCollection = bookings
      .filter((b) => b.status === "Confirmed")
      .reduce((sum, b) => {
        const advance = b.advance.toNumber();
        const paymentSum = b.payments.reduce((s, p) => s + p.amount.toNumber(), 0);
        return sum + (b.total.toNumber() - advance - paymentSum);
      }, 0);

    return NextResponse.json({
      siteNames,
      plotCounts,
      bookings: mappedBookings,
      totalCollection,
      pendingCollection,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
