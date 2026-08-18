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
    type: plan.type as "Full Payment" | "Installment",
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

export async function GET() {
  try {
    const plans = await prisma.paymentPlan.findMany({
      include: { site: { select: { name: true } }, installments: true },
      orderBy: { createdAt: "desc" },
    });

    const mapped = plans.map(mapPlan);
    return NextResponse.json(mapped);
  } catch (error) {
    console.error("Failed to fetch payment plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment plans" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Validate installments if any
    if (installments && installments.length > 0) {
      const validation = validatePlanInstallments(installments);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    // Resolve siteId from site name
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
      const created = await tx.paymentPlan.create({
        data: {
          name: name.trim(),
          type: type === "Full Payment" ? "FullPayment" : "Installment",
          status: status === "Inactive" ? "Inactive" : "Active",
          siteId,
          discount: discount || 0,
        },
      });

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
              planId: created.id,
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
        where: { id: created.id },
        include: { site: { select: { name: true } }, installments: true },
      });
    });

    const mapped = mapPlan(plan!);
    return NextResponse.json(mapped, { status: 201 });
  } catch (error) {
    console.error("Failed to create payment plan:", error);
    return NextResponse.json(
      { error: "Failed to create payment plan" },
      { status: 500 },
    );
  }
}
