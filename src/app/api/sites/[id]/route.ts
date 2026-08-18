import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Site } from "@/lib/types/site";

async function getSiteWithCounts(site: {
  id: number;
  code: string;
  name: string;
  status: "Active" | "Inactive";
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  area: { toNumber: () => number };
  areaUnit: string;
  zoning: string;
  rera: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Promise<Site> {
  const plotCounts = await prisma.plot.groupBy({
    by: ["status"],
    where: { siteId: site.id },
    _count: { id: true },
  });

  let total = 0;
  let available = 0;
  let booked = 0;
  let sold = 0;

  for (const row of plotCounts) {
    total += row._count.id;
    if (row.status === "Available") {
      available = row._count.id;
    } else if (row.status === "Booked" || row.status === "Registered") {
      booked += row._count.id;
    } else if (row.status === "Sold") {
      sold = row._count.id;
    }
  }

  return {
    id: site.id,
    code: site.code,
    name: site.name,
    status: site.status,
    address: site.address,
    city: site.city,
    state: site.state,
    pincode: site.pincode,
    area: site.area.toNumber(),
    areaUnit: site.areaUnit,
    zoning: site.zoning,
    rera: site.rera,
    totalPlots: total,
    availablePlots: available,
    bookedPlots: booked,
    soldPlots: sold,
    createdAt: site.createdAt.toISOString(),
    updatedAt: site.updatedAt.toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const siteId = parseInt(id, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 });
    }

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const siteWithCounts = await getSiteWithCounts(site);
    return NextResponse.json(siteWithCounts);
  } catch (error) {
    console.error("Failed to fetch site:", error);
    return NextResponse.json(
      { error: "Failed to fetch site" },
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
    const siteId = parseInt(id, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      siteCode,
      siteName,
      status,
      address,
      city,
      state,
      pincode,
      totalArea,
      zoningType,
      reraNumber,
    } = body;

    if (!siteCode?.trim() || !siteName?.trim()) {
      return NextResponse.json(
        { error: "Site Code and Site Name are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.site.findUnique({ where: { id: siteId } });
    if (!existing) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    if (siteCode.trim() !== existing.code) {
      const codeTaken = await prisma.site.findUnique({
        where: { code: siteCode.trim() },
      });
      if (codeTaken) {
        return NextResponse.json(
          { error: "A site with this code already exists" },
          { status: 409 },
        );
      }
    }

    const site = await prisma.site.update({
      where: { id: siteId },
      data: {
        code: siteCode.trim(),
        name: siteName.trim(),
        status: status === "Inactive" ? "Inactive" : "Active",
        address: address?.trim() || null,
        city: city?.trim() || "",
        state: state?.trim() || "",
        pincode: pincode?.trim() || null,
        area: parseFloat(totalArea) || 0,
        zoning: zoningType || "Residential",
        rera: reraNumber?.trim() || null,
      },
    });

    const siteWithCounts = await getSiteWithCounts(site);
    return NextResponse.json(siteWithCounts);
  } catch (error) {
    console.error("Failed to update site:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
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
    const siteId = parseInt(id, 10);
    if (isNaN(siteId)) {
      return NextResponse.json({ error: "Invalid site ID" }, { status: 400 });
    }

    const site = await prisma.site.findUnique({ where: { id: siteId } });
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const plotCount = await prisma.plot.count({ where: { siteId } });
    if (plotCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete site "${site.name}" because it has ${plotCount} plot(s). Remove all plots first.`,
        },
        { status: 409 },
      );
    }

    const planCount = await prisma.paymentPlan.count({
      where: { siteId },
    });
    if (planCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete site "${site.name}" because it has ${planCount} payment plan(s). Remove all payment plans first.`,
        },
        { status: 409 },
      );
    }

    await prisma.site.delete({ where: { id: siteId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete site:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 },
    );
  }
}
