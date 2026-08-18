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

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      orderBy: { createdAt: "desc" },
    });

    const sitesWithCounts = await Promise.all(sites.map(getSiteWithCounts));
    return NextResponse.json(sitesWithCounts);
  } catch (error) {
    console.error("Failed to fetch sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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

    const existing = await prisma.site.findUnique({
      where: { code: siteCode.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A site with this code already exists" },
        { status: 409 },
      );
    }

    const site = await prisma.site.create({
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
    return NextResponse.json(siteWithCounts, { status: 201 });
  } catch (error) {
    console.error("Failed to create site:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 },
    );
  }
}
