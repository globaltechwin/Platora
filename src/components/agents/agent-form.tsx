"use client";

import { useState } from "react";
import { User, Building, Save, RefreshCw } from "lucide-react";

export interface AgentFormData {
  fullName: string;
  mobile: string;
  email: string;
  panNumber: string;
  reraAgentNo: string;
  agentCode: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  commissionAmount: number;
  status: string;
}

interface FormErrors {
  fullName?: string;
  mobile?: string;
  commissionAmount?: string;
}

interface AgentFormProps {
  mode: "create" | "edit";
  onSubmit: (data: AgentFormData) => Promise<void> | void;
  onBack?: () => void;
}

const emptyForm: AgentFormData = {
  fullName: "",
  mobile: "",
  email: "",
  panNumber: "",
  reraAgentNo: "",
  agentCode: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  commissionAmount: 0,
  status: "Active",
};

function generateAgentCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `AGT${num}`;
}

export function AgentForm({ mode, onSubmit, onBack }: AgentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors & { submit?: string }>({});
  const [formData, setFormData] = useState<AgentFormData>(emptyForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      commissionAmount: val === "" ? 0 : parseFloat(val) || 0,
    }));
    if (errors.commissionAmount) {
      setErrors((prev) => ({ ...prev, commissionAmount: undefined }));
    }
  };

  const handleRefreshCode = () => {
    setFormData((prev) => ({ ...prev, agentCode: generateAgentCode() }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile is required";
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Mobile must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));
    try {
      await onSubmit({
        ...formData,
        agentCode: formData.agentCode || generateAgentCode(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-6">
        {/* Left Column — Form Sections */}
        <div className="flex-1 space-y-5">
          {/* PERSONAL INFORMATION */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-5">
              <User className="w-4 h-4" />
              Personal Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Agent full name"
                    className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors ${
                      errors.fullName ? "border-red-400" : "border-transparent"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit"
                    maxLength={10}
                    className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors ${
                      errors.mobile ? "border-red-400" : "border-transparent"
                    }`}
                  />
                  {errors.mobile && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.mobile}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="agent@example.com"
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    PAN Number
                  </label>
                  <input
                    type="text"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    RERA Agent No.
                  </label>
                  <input
                    type="text"
                    name="reraAgentNo"
                    value={formData.reraAgentNo}
                    onChange={handleChange}
                    placeholder="RERA/AG/XXXXX"
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Agent Code
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="agentCode"
                      value={formData.agentCode}
                      onChange={handleChange}
                      placeholder="AUTO-GENERATED"
                      className="flex-1 px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleRefreshCode}
                      className="p-2.5 text-muted hover:text-foreground hover:bg-input-bg rounded-lg transition-colors"
                      title="Generate new code"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Leave blank to auto-generate on save.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* BANK DETAILS */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-5">
              <Building className="w-4 h-4" />
              Bank Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Bank"
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Account No.
                </label>
                <input
                  type="text"
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Commission & Status + Actions */}
        <div className="w-80 flex-shrink-0 space-y-5">
          {/* COMMISSION & STATUS */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-5">
              <span className="text-base">₹</span>
              Commission &amp; Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Commission Amount / Sq.Ft{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-transparent rounded-l-lg text-sm text-muted">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="commissionAmount"
                    value={formData.commissionAmount || ""}
                    onChange={handleCommissionChange}
                    min="0"
                    step="0.01"
                    className="flex-1 px-3 py-2.5 bg-input-bg border border-transparent rounded-r-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                  <span className="px-3 py-2.5 bg-gray-100 border border-l-0 border-transparent rounded-r-lg text-sm text-muted">
                    / Sq.Ft
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  Fixed amount per square foot paid on booking.
                </p>
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

          {/* Actions */}
          <div className="space-y-3">
            {errors.submit && (
              <p className="text-sm text-red-600">{errors.submit}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? mode === "create"
                  ? "Saving..."
                  : "Updating..."
                : mode === "create"
                  ? "Save Agent"
                  : "Update Agent"}
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full px-5 py-2.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                Save &amp; View All Agents
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
