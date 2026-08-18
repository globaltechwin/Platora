import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toUIStatus, toDBType } from "@/lib/types/plot";
import type { Plot } from "@/lib/types/plot";
import type { Prisma } from "@prisma/client";

const PlotStatus = {
  Available: "Available",
} as const;

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

export async function GET() {
  try {
    const plots = await prisma.plot.findMany({
      include: { site: { select: { name: true } } },
      orderBy: [{ siteId: "asc" }, { code: "asc" }],
    });

    const mapped = plots.map(mapPlot);
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch plots:", error);
    return NextResponse.json(
      { error: "Failed to fetch plots" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      site,
      block,
      plotPrefix,
      numberingType,
      from,
      to,
      length,
      width,
      ratePerSqft,
      plcCharges,
      facing,
      type,
    } = body;

    if (!site?.trim()) {
      return NextResponse.json(
        { error: "Site is required" },
        { status: 400 },
      );
    }

    const siteRecord = await prisma.site.findFirst({
      where: { name: site.trim() },
      select: { id: true, name: true },
    });
    if (!siteRecord) {
      return NextResponse.json(
        { error: "Site not found" },
        { status: 400 },
      );
    }

    const fromNum = parseInt(from, 10);
    const toNum = parseInt(to, 10);
    if (isNaN(fromNum) || isNaN(toNum) || fromNum > toNum || fromNum < 1) {
      return NextResponse.json(
        { error: "Invalid plot range" },
        { status: 400 },
      );
    }

    const area = (parseFloat(length) || 0) * (parseFloat(width) || 0);
    const dims =
      length && width ? `${length}x${width}` : null;
    const dbType = toDBType(type);

    const plotData: {
      code: string;
      block: string;
      area: number;
      areaUnit: string;
      status: "Available";
      facing: string;
      siteId: number;
      type: "Corner" | "RoadFacing" | "Regular" | "ParkFacing" | null;
      dimensions: string | null;
      ratePerSqft: number | null;
      plcCharges: number | null;
    }[] = [];

    for (let i = fromNum; i <= toNum; i++) {
      const code =
        numberingType === "Alpha"
          ? `${plotPrefix}${String.fromCharCode(64 + i)}`
          : `${plotPrefix}${i}`;

      plotData.push({
        code,
        block: block || "-",
        area,
        areaUnit: "Sq.ft",
        status: PlotStatus.Available,
        facing: facing || "North",
        siteId: siteRecord.id,
        type: dbType as "Corner" | "RoadFacing" | "Regular" | "ParkFacing" | null,
        dimensions: dims,
        ratePerSqft: parseFloat(ratePerSqft) || null,
        plcCharges: parseFloat(plcCharges) || null,
      });
    }

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Check for existing codes within this site
      const existingCodes = await tx.plot.findMany({
        where: {
          siteId: siteRecord.id,
          code: { in: plotData.map((p) => p.code) },
        },
        select: { code: true },
      });

      if (existingCodes.length > 0) {
        const duplicateList = existingCodes.map((e: { code: string }) => e.code).join(", ");
        throw new Error(
          `Plot code(s) already exist in site "${siteRecord.name}": ${duplicateList}`,
        );
      }

      await tx.plot.createMany({ data: plotData });

      return tx.plot.findMany({
        where: {
          siteId: siteRecord.id,
          code: { in: plotData.map((p) => p.code) },
        },
        include: { site: { select: { name: true } } },
        orderBy: { code: "asc" },
      });
    });

    return NextResponse.json(created.map(mapPlot), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create plots";
    console.error("Failed to create plots:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
