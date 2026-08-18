import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validatePlanInstallments } from "@/lib/db/validators";
import type { PaymentPlan } from "@/lib/types/payment-plan";

function mapPlan(plan: {
  id: number;
  name: string;
  type: string;
  status: string;
  siteId: number | null;
  site: { name: string } | null;
  discount: { toNumber: () => number };
  createdAt: Date;
  installments: {
    id: number;
    name: string;
    paymentPercent: { toNumber: () => number };
    dueDays: number;
    mandatory: boolean;
    orderIndex: number;
  }[];
}): PaymentPlan {
  return {
    id: String(plan.id),
    name: plan.name,
    type: plan.type === "FullPayment" ? "Full Payment" : "Installment",
    status: plan.status as "Active" | "Inactive",
    site: plan.site?.name ?? "All Sites",
    siteId: plan.siteId,
    discount: plan.discount.toNumber(),
    installments: plan.installments
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((inst) => ({
        id: String(inst.id),
        name: inst.name,
        paymentPercent: inst.paymentPercent.toNumber(),
        dueDays: inst.dueDays,
        mandatory: inst.mandatory,
        orderIndex: inst.orderIndex,
      })),
    createdOn: plan.createdAt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const planId = parseInt(id, 10);
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId },
      include: { site: { select: { name: true } }, installments: true },
    });
    if (!plan) {
      return NextResponse.json({ error: "Payment plan not found" }, { status: 404 });
    }

    return NextResponse.json(mapPlan(plan));
  } catch (error) {
    console.error("Failed to fetch payment plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment plan" },
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
    const planId = parseInt(id, 10);
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const existing = await prisma.paymentPlan.findUnique({ where: { id: planId } });
    if (!existing) {
      return NextResponse.json({ error: "Payment plan not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, type, status, site, discount, installments } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Plan name is required" },
        { status: 400 },
      );
    }
    if (!type) {
      return NextResponse.json(
        { error: "Plan type is required" },
        { status: 400 },
      );
    }

    if (installments && installments.length > 0) {
      const validation = validatePlanInstallments(installments);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    let siteId: number | null = null;
    if (site && site !== "All Sites (Global)") {
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

    const plan = await prisma.$transaction(async (tx) => {
      const updated = await tx.paymentPlan.update({
        where: { id: planId },
        data: {
          name: name.trim(),
          type: type === "Full Payment" ? "FullPayment" : "Installment",
          status: status === "Inactive" ? "Inactive" : "Active",
          siteId,
          discount: discount || 0,
        },
      });

      // Delete existing installments and recreate
      await tx.planInstallment.deleteMany({ where: { planId } });

      if (installments && installments.length > 0) {
        await tx.planInstallment.createMany({
          data: installments.map(
            (
              inst: {
                name: string;
                paymentPercent: number;
                dueDays: number;
                mandatory: boolean;
              },
              idx: number,
            ) => ({
              planId: updated.id,
              name: inst.name,
              paymentPercent: inst.paymentPercent,
              dueDays: inst.dueDays,
              mandatory: inst.mandatory,
              orderIndex: idx,
            }),
          ),
        });
      }

      return tx.paymentPlan.findUnique({
        where: { id: updated.id },
        include: { site: { select: { name: true } }, installments: true },
      });
    });

    return NextResponse.json(mapPlan(plan!));
  } catch (error) {
    console.error("Failed to update payment plan:", error);
    return NextResponse.json(
      { error: "Failed to update payment plan" },
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
    const planId = parseInt(id, 10);
    if (isNaN(planId)) {
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
    }

    const plan = await prisma.paymentPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Payment plan not found" }, { status: 404 });
    }

    // Check for bookings referencing this plan
    const bookingCount = await prisma.booking.count({
      where: { paymentPlanId: planId },
    });
    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete plan "${plan.name}" because it is used by ${bookingCount} booking(s). Remove or reassign those bookings first.`,
        },
        { status: 409 },
      );
    }

    // Delete plan (installments cascade via onDelete: Cascade)
    await prisma.paymentPlan.delete({ where: { id: planId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete payment plan:", error);
    return NextResponse.json(
      { error: "Failed to delete payment plan" },
      { status: 500 },
    );
  }
}
