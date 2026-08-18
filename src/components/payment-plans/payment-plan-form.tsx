"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  X,
  CheckCircle,
  Plus,
  Trash2,
  Info,
  List,
  Save,
} from "lucide-react";
import type { PaymentPlan, InstallmentRow } from "@/lib/types/payment-plan";

interface PaymentPlanFormData {
  name: string;
  type: string;
  status: string;
  site: string;
  discount: number;
  installments: InstallmentRow[];
}

interface PaymentPlanFormProps {
  mode: "create" | "edit";
  initialValues?: PaymentPlan;
  onSubmit: (data: PaymentPlanFormData) => Promise<void> | void;
  onCancel?: () => void;
}

function planToFormData(plan: PaymentPlan): PaymentPlanFormData {
  return {
    name: plan.name,
    type: plan.type,
    status: plan.status,
    site: plan.site,
    discount: plan.discount,
    installments: plan.installments.map((r) => ({ ...r })),
  };
}

export function PaymentPlanForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
}: PaymentPlanFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    submit?: string;
  }>({});

  const [formData, setFormData] = useState<PaymentPlanFormData>(
    initialValues
      ? planToFormData(initialValues)
      : {
          name: "",
          type: "",
          status: "Active",
          site: "All Sites (Global)",
          discount: 0,
          installments: [],
        }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "discount" ? parseFloat(value) || 0 : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddRow = () => {
    const newRow: InstallmentRow = {
      id: String(Date.now()),
      name: "",
      paymentPercent: 0,
      dueDays: 0,
      mandatory: true,
    };
    setFormData((prev) => ({
      ...prev,
      installments: [...prev.installments, newRow],
    }));
  };

  const handleRemoveRow = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      installments: prev.installments.filter((r) => r.id !== id),
    }));
  };

  const handleRowChange = (
    id: string,
    field: keyof InstallmentRow,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      installments: prev.installments.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      ),
    }));
  };

  const totalPercent = formData.installments.reduce(
    (sum, r) => sum + r.paymentPercent,
    0
  );

  const validate = (): boolean => {
    const newErrors: { name?: string; type?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Plan name is required";
    }
    if (!formData.type) {
      newErrors.type = "Plan type is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (totalPercent !== 100) {
      setErrors((prev) => ({
        ...prev,
        submit: `Installment percentages must total 100%. Current total: ${totalPercent}%`,
      }));
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));
    try {
      await onSubmit(formData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Plan Details Section */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider mb-4">
            <Info className="w-4 h-4" />
            Plan Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Full Payment Plan, EMI 24 Months..."
                className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors ${
                  errors.name ? "border-red-400" : "border-transparent"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Plan Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer ${
                  errors.type ? "border-red-400" : "border-transparent"
                }`}
              >
                <option value="">-- Select Type --</option>
                <option>Full Payment</option>
                <option>Installment</option>
              </select>
              {errors.type && (
                <p className="text-xs text-red-500 mt-1">{errors.type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Discount %
              </label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Applicable Site
              </label>
              <select
                name="site"
                value={formData.site}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option>All Sites (Global)</option>
                <option>ALAPAKKAM</option>
                <option>Trichy</option>
                <option>VANDALUR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Installment Schedule Section */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="flex items-center gap-2 text-xs font-bold text-purple-600 uppercase tracking-wider">
              <List className="w-4 h-4" />
              Installment Schedule
            </h3>
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </button>
            <span className="text-xs text-muted ml-2">
              Total % must equal 100
            </span>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-4 py-2.5 text-left font-semibold w-12">
                    #
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold">
                    Installment Name
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold w-28">
                    Payment %
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold w-28">
                    Due Days
                  </th>
                  <th className="px-4 py-2.5 text-left font-semibold w-28">
                    Mandatory
                  </th>
                  <th className="px-4 py-2.5 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {formData.installments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted text-sm"
                    >
                      No installments added. Click &quot;Add Row&quot; to add
                      one.
                    </td>
                  </tr>
                ) : (
                  formData.installments.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-t border-border hover:bg-gray-50"
                    >
                      <td className="px-4 py-2.5 text-muted">{index + 1}</td>
                      <td className="px-4 py-2.5">
                        <input
                          type="text"
                          value={row.name}
                          onChange={(e) =>
                            handleRowChange(row.id, "name", e.target.value)
                          }
                          placeholder="e.g. Down Payment"
                          className="w-full px-2 py-1.5 bg-input-bg border border-transparent rounded text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={row.paymentPercent}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "paymentPercent",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min="0"
                          max="100"
                          className="w-full px-2 py-1.5 bg-input-bg border border-transparent rounded text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="number"
                          value={row.dueDays}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "dueDays",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min="0"
                          className="w-full px-2 py-1.5 bg-input-bg border border-transparent rounded text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="checkbox"
                          checked={row.mandatory}
                          onChange={(e) =>
                            handleRowChange(
                              row.id,
                              "mandatory",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end mt-2">
            <span
              className={`text-sm font-semibold ${
                totalPercent === 100
                  ? "text-emerald-600"
                  : totalPercent > 100
                    ? "text-red-600"
                    : "text-muted"
              }`}
            >
              Total: {totalPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-gray-50">
        {errors.submit && (
          <p className="text-sm text-red-600 mr-auto">{errors.submit}</p>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-white border border-border text-foreground text-sm font-medium rounded-lg hover:bg-input-bg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSubmitting
            ? mode === "create"
              ? "Saving..."
              : "Updating..."
            : mode === "create"
              ? "Save Plan"
              : "Update Plan"}
        </button>
      </div>
    </form>
  );
}

interface AddPaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanAdded?: (data: PaymentPlanFormData) => Promise<void>;
}

export function AddPaymentPlanModal({
  isOpen,
  onClose,
  onPlanAdded,
}: AddPaymentPlanModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const handleSubmit = async (data: PaymentPlanFormData) => {
    await onPlanAdded?.(data);
    setShowSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {showSuccess ? (
          <div className="px-12 py-16 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Plan Created!
            </h2>
            <p className="text-sm text-muted">
              The new payment plan has been added successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Purple Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Payment Plan
                </h1>
                <p className="text-sm text-purple-100 mt-0.5">
                  Configure plan details and installment schedule
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <PaymentPlanForm mode="create" onSubmit={handleSubmit} onCancel={handleClose} />
          </>
        )}
      </div>
    </div>
  );
}

interface EditPaymentPlanModalProps {
  isOpen: boolean;
  plan: PaymentPlan | null;
  onClose: () => void;
  onPlanUpdated?: (data: PaymentPlanFormData) => Promise<void>;
}

export function EditPaymentPlanModal({
  isOpen,
  plan,
  onClose,
  onPlanUpdated,
}: EditPaymentPlanModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

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

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const handleSubmit = async (data: PaymentPlanFormData) => {
    await onPlanUpdated?.(data);
    setShowSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {showSuccess ? (
          <div className="px-12 py-16 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Plan Updated!
            </h2>
            <p className="text-sm text-muted">
              The payment plan has been updated successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Purple Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Edit Payment Plan
                </h1>
                <p className="text-sm text-purple-100 mt-0.5">
                  Configure plan details and installment schedule
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <PaymentPlanForm
              mode="edit"
              initialValues={plan}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </>
        )}
      </div>
    </div>
  );
}
