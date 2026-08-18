"use client";

import { MapPin, Pencil, Trash2, CreditCard, Wallet } from "lucide-react";
import type { PaymentPlan } from "@/lib/types/payment-plan";

interface PaymentPlanCardProps {
  plan: PaymentPlan;
  onEdit: (plan: PaymentPlan) => void;
  onDelete: (plan: PaymentPlan) => void;
}

export function PaymentPlanCard({
  plan,
  onEdit,
  onDelete,
}: PaymentPlanCardProps) {
  const isInstallment = plan.type === "Installment";

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md ${
              isInstallment
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {isInstallment ? (
              <Wallet className="w-3.5 h-3.5" />
            ) : (
              <CreditCard className="w-3.5 h-3.5" />
            )}
            {plan.type}
          </span>
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-md ${
              plan.status === "Active"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {plan.status}
          </span>
        </div>

        <h3 className="text-base font-bold text-foreground">{plan.name}</h3>

        <div className="flex items-center gap-1 text-xs text-muted mt-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>{plan.site}</span>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 pb-3">
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Discount</span>
            <span className="font-medium text-foreground">{plan.discount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Installments</span>
            <span className="font-medium text-foreground">
              {plan.installments.length} rows
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Created On</span>
            <span className="font-medium text-foreground">
              {plan.createdOn}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <button
          onClick={() => onEdit(plan)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(plan)}
          className="text-sm text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
