import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface InventoryRow {
  id: number;
  site: string;
  block: string;
  plotNo: string;
  type: string;
  facing: string;
  area: number;
  ratePerSqft: number;
  value: number;
  status: "Available" | "OnHold" | "Booked" | "Sold";
  customerName?: string;
}

function toInventoryStatus(dbStatus: string): "Available" | "OnHold" | "Booked" | "Sold" {
  switch (dbStatus) {
    case "Available":
      return "Available";
    case "Blocked":
    case "BlockedAdmin":
      return "OnHold";
    case "Booked":
    case "Registered":
      return "Booked";
    case "Sold":
      return "Sold";
    default:
      return "Available";
  }
}

export async function GET() {
  try {
    const plots = await prisma.plot.findMany({
      include: {
        site: { select: { name: true } },
        bookings: {
          where: { status: "Confirmed" },
          take: 1,
          include: { customer: { select: { name: true } } },
        },
      },
      orderBy: [{ siteId: "asc" }, { code: "asc" }],
    });

    const rows: InventoryRow[] = plots.map(
      (p: {
        id: number;
        status: string;
        block: string;
        code: string;
        type: string | null;
        facing: string;
        area: { toNumber: () => number };
        ratePerSqft: { toNumber: () => number } | null;
        site: { name: string };
        bookings: { customer: { name: string } }[];
      }) => {
        const area = p.area.toNumber();
        const rate = p.ratePerSqft?.toNumber() ?? 0;
        return {
          id: p.id,
          site: p.site.name,
          block: p.block,
          plotNo: p.code,
          type: p.type ?? "—",
          facing: p.facing || "—",
          area,
          ratePerSqft: rate,
          value: area * rate,
          status: toInventoryStatus(p.status),
          customerName: p.bookings[0]?.customer.name,
        };
      },
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch inventory report:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory report" },
      { status: 500 },
    );
  }
}
