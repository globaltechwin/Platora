"use client";

import { useState } from "react";
import {
  Info,
  Map,
  Building2,
  Save,
} from "lucide-react";
import type { Site } from "@/lib/types/site";

export interface SiteFormData {
  siteCode: string;
  siteName: string;
  status: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalArea: string;
  zoningType: string;
  reraNumber: string;
}

interface FormErrors {
  siteCode?: string;
  siteName?: string;
}

interface SiteFormProps {
  mode: "create" | "edit";
  initialValues?: Site;
  onSubmit: (data: SiteFormData) => void | Promise<void>;
}

const emptyForm: SiteFormData = {
  siteCode: "",
  siteName: "",
  status: "Active",
  address: "",
  city: "",
  state: "",
  pincode: "",
  totalArea: "",
  zoningType: "",
  reraNumber: "",
};

function siteToFormData(site: Site): SiteFormData {
  return {
    siteCode: site.code,
    siteName: site.name,
    status: site.status,
    address: site.address || "",
    city: site.city,
    state: site.state,
    pincode: site.pincode || "",
    totalArea: site.area.toString(),
    zoningType: site.zoning,
    reraNumber: site.rera || "",
  };
}

export function SiteForm({ mode, initialValues, onSubmit }: SiteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<SiteFormData>(
    initialValues ? siteToFormData(initialValues) : emptyForm
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.siteCode.trim()) {
      newErrors.siteCode = "Site Code is required";
    }
    if (!formData.siteName.trim()) {
      newErrors.siteName = "Site Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* BASIC INFORMATION */}
      <div>
        <h2 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-4">
          <Info className="w-4 h-4" />
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Site Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siteCode"
              value={formData.siteCode}
              onChange={handleChange}
              placeholder="e.g. SITE-001"
              className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors ${
                errors.siteCode ? "border-red-400" : "border-transparent"
              }`}
            />
            {errors.siteCode && (
              <p className="text-xs text-red-500 mt-1">{errors.siteCode}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="Full project / site name"
              className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors ${
                errors.siteName ? "border-red-400" : "border-transparent"
              }`}
            />
            {errors.siteName && (
              <p className="text-xs text-red-500 mt-1">{errors.siteName}</p>
            )}
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

      {/* ADDRESS */}
      <div>
        <h2 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-4">
          <Map className="w-4 h-4" />
          Address
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street / survey number"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Pincode
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PROJECT DETAILS */}
      <div>
        <h2 className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-4">
          <Building2 className="w-4 h-4" />
          Project Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Total Area (Acres)
            </label>
            <input
              type="number"
              name="totalArea"
              value={formData.totalArea}
              onChange={handleChange}
              placeholder="0.0000"
              step="0.0001"
              min="0"
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Zoning Type
            </label>
            <select
              name="zoningType"
              value={formData.zoningType}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option value="">- Select -</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Agricultural</option>
              <option>Industrial</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              RERA Number
            </label>
            <input
              type="text"
              name="reraNumber"
              value={formData.reraNumber}
              onChange={handleChange}
              placeholder="RERA registration number"
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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
              ? "Save Site"
              : "Update Site"}
        </button>
      </div>
    </form>
  );
}
