import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toUIStatus, toDBStatus, toDBType } from "@/lib/types/plot";
import type { Plot } from "@/lib/types/plot";

function mapPlot(plot: {
  id: number;
  code: string;
  block: string;
  area: { toNumber: () => number };
  areaUnit: string;
  status: string;
  facing: string;
  siteId: number;
  site: { name: string };
  type: string | null;
  dimensions: string | null;
  ratePerSqft: { toNumber: () => number } | null;
  plcCharges: { toNumber: () => number } | null;
}): Plot {
  return {
    id: String(plot.id),
    code: plot.code,
    block: plot.block,
    area: plot.area.toNumber(),
    areaUnit: plot.areaUnit,
    status: toUIStatus(plot.status),
    facing: plot.facing,
    siteId: plot.siteId,
    siteName: plot.site.name,
    type: plot.type ?? undefined,
    dimensions: plot.dimensions ?? undefined,
    ratePerSqft: plot.ratePerSqft?.toNumber() ?? undefined,
    plcCharges: plot.plcCharges?.toNumber() ?? undefined,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const plotId = parseInt(id, 10);
    if (isNaN(plotId)) {
      return NextResponse.json({ error: "Invalid plot ID" }, { status: 400 });
    }

    const plot = await prisma.plot.findUnique({
      where: { id: plotId },
      include: { site: { select: { name: true } } },
    });
    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    return NextResponse.json(mapPlot(plot));
  } catch (error) {
    console.error("Failed to fetch plot:", error);
    return NextResponse.json(
      { error: "Failed to fetch plot" },
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
    const plotId = parseInt(id, 10);
    if (isNaN(plotId)) {
      return NextResponse.json({ error: "Invalid plot ID" }, { status: 400 });
    }

    const existing = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!existing) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      site,
      code,
      block,
      area,
      areaUnit,
      status,
      facing,
      type,
      dimensions,
      ratePerSqft,
      plcCharges,
    } = body;

    // Resolve siteId if site name provided
    let siteId = existing.siteId;
    if (site && site !== existing.siteId) {
      const siteRecord = await prisma.site.findFirst({
        where: { name: site },
        select: { id: true },
      });
      if (!siteRecord) {
        return NextResponse.json(
          { error: "Site not found" },
          { status: 400 },
        );
      }
      siteId = siteRecord.id;
    }

    // Validate status
    if (status) {
      const dbStatus = toDBStatus(status);
      const validStatuses = [
        "Available",
        "Blocked",
        "Booked",
        "Registered",
        "Sold",
        "BlockedAdmin",
      ];
      if (!validStatuses.includes(dbStatus)) {
        return NextResponse.json(
          { error: "Invalid plot status" },
          { status: 400 },
        );
      }
    }

    // Check compound uniqueness if code or site changed
    if (code && (code !== existing.code || siteId !== existing.siteId)) {
      const duplicate = await prisma.plot.findFirst({
        where: {
          siteId,
          code,
          id: { not: plotId },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          {
            error: `Plot code "${code}" already exists in this site`,
          },
          { status: 409 },
        );
      }
    }

    const plot = await prisma.plot.update({
      where: { id: plotId },
      data: {
        code: code?.trim() || existing.code,
        block: block?.trim() || existing.block,
        area: area != null ? parseFloat(area) : undefined,
        areaUnit: areaUnit?.trim() || undefined,
        status: status ? (toDBStatus(status) as "Available" | "Blocked" | "Booked" | "Registered" | "Sold" | "BlockedAdmin") : undefined,
        facing: facing?.trim() || undefined,
        siteId,
        type: type != null ? (toDBType(type) as "Corner" | "RoadFacing" | "Regular" | "ParkFacing") : undefined,
        dimensions: dimensions?.trim() || null,
        ratePerSqft: ratePerSqft != null ? parseFloat(ratePerSqft) : undefined,
        plcCharges: plcCharges != null ? parseFloat(plcCharges) : undefined,
      },
      include: { site: { select: { name: true } } },
    });

    return NextResponse.json(mapPlot(plot));
  } catch (error) {
    console.error("Failed to update plot:", error);
    return NextResponse.json(
      { error: "Failed to update plot" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const plotId = parseInt(id, 10);
    if (isNaN(plotId)) {
      return NextResponse.json({ error: "Invalid plot ID" }, { status: 400 });
    }

    const plot = await prisma.plot.findUnique({ where: { id: plotId } });
    if (!plot) {
      return NextResponse.json({ error: "Plot not found" }, { status: 404 });
    }

    const bookingCount = await prisma.booking.count({
      where: { plotId },
    });
    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete plot "${plot.code}" because it has ${bookingCount} booking(s). Remove or cancel those bookings first.`,
        },
        { status: 409 },
      );
    }

    await prisma.plot.delete({ where: { id: plotId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete plot:", error);
    return NextResponse.json(
      { error: "Failed to delete plot" },
      { status: 500 },
    );
  }
}
