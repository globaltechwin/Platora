"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  CheckCircle,
  Settings,
  Sliders,
  RefreshCw,
} from "lucide-react";

interface PlotFormData {
  site: string;
  block: string;
  plotPrefix: string;
  numberingType: "Numeric" | "Alpha";
  from: number;
  to: number;
  length: number;
  width: number;
  ratePerSqft: number;
  plcCharges: number;
  facing: string;
  type: string;
}

interface SiteOption {
  id: number;
  name: string;
}

interface PlotFormProps {
  mode: "create" | "edit";
  initialSite?: string;
  onSubmit: (data: PlotFormData) => Promise<void> | void;
  onCancel?: () => void;
}

const emptyForm: PlotFormData = {
  site: "ALAPAKKAM",
  block: "",
  plotPrefix: "",
  numberingType: "Numeric",
  from: 1,
  to: 10,
  length: 30,
  width: 40,
  ratePerSqft: 0,
  plcCharges: 0,
  facing: "",
  type: "",
};

export function PlotForm({
  mode,
  initialSite,
  onSubmit,
  onCancel,
}: PlotFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    site?: string;
    submit?: string;
  }>({});
  const [siteOptions, setSiteOptions] = useState<SiteOption[]>([]);

  const [formData, setFormData] = useState<PlotFormData>({
    ...emptyForm,
    site: initialSite || emptyForm.site,
  });

  useEffect(() => {
    fetch("/api/sites")
      .then((res) => res.json())
      .then((data: SiteOption[]) => setSiteOptions(data))
      .catch(() => setSiteOptions([]));
  }, []);

  const area = formData.length * formData.width;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["from", "to", "length", "width", "ratePerSqft", "plcCharges"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNumberingType = (type: "Numeric" | "Alpha") => {
    setFormData((prev) => ({ ...prev, numberingType: type }));
  };

  const validate = (): boolean => {
    const newErrors: { site?: string } = {};
    if (!formData.site) {
      newErrors.site = "Site is required";
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
        {/* Step 1 — Configuration */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
            <Settings className="w-4 h-4" />
            Step 1 — Configuration
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Site <span className="text-red-500">*</span>
              </label>
              <select
                name="site"
                value={formData.site}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 bg-input-bg border rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer ${
                  errors.site ? "border-red-400" : "border-transparent"
                }`}
              >
                {siteOptions.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.site && (
                <p className="text-xs text-red-500 mt-1">{errors.site}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Block <span className="text-muted text-xs">(optional)</span>
              </label>
              <select
                name="block"
                value={formData.block}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="">— Select Block —</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
                <option>D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Plot Prefix
              </label>
              <input
                type="text"
                name="plotPrefix"
                value={formData.plotPrefix}
                onChange={handleChange}
                placeholder="e.g. A, B, PLOT-"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Numbering Type
              </label>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleNumberingType("Numeric")}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                    formData.numberingType === "Numeric"
                      ? "bg-blue-600 text-white"
                      : "bg-input-bg text-muted hover:bg-gray-200"
                  }`}
                >
                  123
                  <br />
                  <span className="text-[10px]">Numeric</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNumberingType("Alpha")}
                  className={`flex-1 px-3 py-2.5 text-sm font-medium transition-colors ${
                    formData.numberingType === "Alpha"
                      ? "bg-blue-600 text-white"
                      : "bg-input-bg text-muted hover:bg-gray-200"
                  }`}
                >
                  ABC
                  <br />
                  <span className="text-[10px]">Alpha</span>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                From
              </label>
              <input
                type="number"
                name="from"
                value={formData.from}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                To
              </label>
              <input
                type="number"
                name="to"
                value={formData.to}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Step 2 — Common Defaults */}
        <div>
          <h3 className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">
            <Sliders className="w-4 h-4" />
            Step 2 — Common Defaults{" "}
            <span className="text-xs font-normal text-muted normal-case tracking-normal">
              (applied to all generated plots — you can override per row)
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Length (ft)
              </label>
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Width (ft)
              </label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Area (Sq.ft){" "}
                <span className="text-xs text-muted font-normal">(auto)</span>
              </label>
              <input
                type="text"
                value={area > 0 ? area.toLocaleString() : "auto-calc"}
                readOnly
                className="w-full px-3 py-2.5 bg-gray-100 border border-transparent rounded-lg text-sm text-muted cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Rate / Sq.ft (₹)
              </label>
              <input
                type="number"
                name="ratePerSqft"
                value={formData.ratePerSqft}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                PLC Charges (₹)
              </label>
              <input
                type="number"
                name="plcCharges"
                value={formData.plcCharges}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Facing
              </label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="">—</option>
                <option>North</option>
                <option>South</option>
                <option>East</option>
                <option>West</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
              >
                <option value="">—</option>
                <option>Regular</option>
                <option>Corner</option>
                <option>Corner Road</option>
                <option>Park Facing</option>
              </select>
            </div>
          </div>

          {/* Generate Preview Button */}
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Generate Preview
            </button>
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
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? "Saving..." : mode === "create" ? "Add Plots" : "Update Plots"}
        </button>
      </div>
    </form>
  );
}

interface AddPlotModalProps {
  isOpen: boolean;
  initialSite?: string;
  onClose: () => void;
  onPlotAdded?: (data: PlotFormData) => Promise<void>;
}

export function AddPlotModal({
  isOpen,
  initialSite,
  onClose,
  onPlotAdded,
}: AddPlotModalProps) {
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

  const handleSubmit = async (data: PlotFormData) => {
    await onPlotAdded?.(data);
    setShowSuccess(true);
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {showSuccess ? (
          <div className="px-12 py-16 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Plots Added!
            </h2>
            <p className="text-sm text-muted">
              The new plots have been added successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Blue Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Plots to Site
                </h1>
                <p className="text-sm text-blue-100 mt-0.5">
                  Configure and preview plots before saving
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
            <PlotForm
              mode="create"
              initialSite={initialSite}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </>
        )}
      </div>
    </div>
  );
}
