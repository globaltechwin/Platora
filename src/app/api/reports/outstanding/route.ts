import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface OutstandingRow {
  id: number;
  bookingNo: string;
  customer: string;
  mobile: string;
  sitePlot: string;
  installment: string;
  dueDate: string;
  due: number;
  paid: number;
  balance: number;
  overdueDays: number;
  status: "Pending" | "Overdue" | "Paid";
}

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedules = await prisma.installmentSchedule.findMany({
      include: {
        booking: {
          include: {
            customer: { select: { name: true, mobile: true } },
            plot: {
              include: { site: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const rows: OutstandingRow[] = schedules.map((s) => {
      const due = s.due.toNumber();
      const paid = s.paid.toNumber();
      const balance = due - paid;

      let overdueDays = 0;
      if (balance > 0) {
        const dueDate = new Date(s.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          overdueDays = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
          );
        }
      }

      let status: "Pending" | "Overdue" | "Paid" = s.status as "Pending" | "Overdue" | "Paid";
      if (status === "Paid") {
        // keep Paid
      } else if (overdueDays > 0) {
        status = "Overdue";
      } else {
        status = "Pending";
      }

      return {
        id: s.id,
        bookingNo: s.booking.bookingNo,
        customer: s.booking.customer.name,
        mobile: s.booking.customer.mobile,
        sitePlot: `${s.booking.plot.site.name} / ${s.booking.plot.code}`,
        installment: s.installmentName,
        dueDate: s.dueDate.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        due,
        paid,
        balance,
        overdueDays,
        status,
      };
    });

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch outstanding report:", error);
    return NextResponse.json(
      { error: "Failed to fetch outstanding report" },
      { status: 500 },
    );
  }
}
