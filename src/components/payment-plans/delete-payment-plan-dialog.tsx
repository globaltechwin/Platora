"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { PaymentPlan } from "@/lib/types/payment-plan";

interface DeletePaymentPlanDialogProps {
  isOpen: boolean;
  plan: PaymentPlan | null;
  onClose: () => void;
  onConfirm: (plan: PaymentPlan) => Promise<void>;
}

export function DeletePaymentPlanDialog({
  isOpen,
  plan,
  onClose,
  onConfirm,
}: DeletePaymentPlanDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!plan || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm(plan);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete";
      setError(message);
      setIsDeleting(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">
                Delete plan &ldquo;{plan.name}&rdquo;?
              </h2>
              <p className="text-sm text-muted mt-2">
                This cannot be undone. Plans used by existing bookings cannot be deleted.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-border">
          {error && (
            <p className="text-sm text-red-600 mr-auto">{error}</p>
          )}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-white border border-border text-foreground text-sm font-medium rounded-lg hover:bg-input-bg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
}
