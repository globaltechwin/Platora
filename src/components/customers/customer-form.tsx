"use client";

import { useState, useEffect } from "react";
import {
  User,
  Shield,
  MapPin,
  Users,
  Save,
  ArrowLeft,
} from "lucide-react";

export interface CustomerFormData {
  fullName: string;
  mobile: string;
  alternateMobile: string;
  email: string;
  dateOfBirth: string;
  occupation: string;
  panNumber: string;
  aadhaarNumber: string;
  passportNo: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  coApplicantName: string;
  coApplicantPan: string;
  coApplicantAadhaar: string;
  leadSource: string;
  leadStage: string;
  referredByAgent: string;
  interestedIn: string;
  notesRemarks: string;
}

interface FormErrors {
  fullName?: string;
  mobile?: string;
}

interface CustomerFormProps {
  mode: "create" | "edit";
  onSubmit: (data: CustomerFormData) => Promise<void> | void;
  onBack?: () => void;
  submitLabel?: string;
}

const emptyForm: CustomerFormData = {
  fullName: "",
  mobile: "",
  alternateMobile: "",
  email: "",
  dateOfBirth: "",
  occupation: "",
  panNumber: "",
  aadhaarNumber: "",
  passportNo: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  coApplicantName: "",
  coApplicantPan: "",
  coApplicantAadhaar: "",
  leadSource: "",
  leadStage: "Lead",
  referredByAgent: "",
  interestedIn: "",
  notesRemarks: "",
};

export function CustomerForm({
  mode,
  onSubmit,
  onBack,
  submitLabel,
}: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors & { submit?: string }>({});
  const [formData, setFormData] = useState<CustomerFormData>(emptyForm);
  const [agentNames, setAgentNames] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data: { name: string }[]) => setAgentNames(data.map((a) => a.name)))
      .catch(() => setAgentNames([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
      await onSubmit(formData);
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
                    placeholder="Customer full name"
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
                    Alternate Mobile
                  </label>
                  <input
                    type="text"
                    name="alternateMobile"
                    value={formData.alternateMobile}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KYC DETAILS */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-5">
              <Shield className="w-4 h-4" />
              KYC Details
            </h2>
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
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleChange}
                  placeholder="12-digit"
                  maxLength={12}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Passport No.
                </label>
                <input
                  type="text"
                  name="passportNo"
                  value={formData.passportNo}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-5">
              <MapPin className="w-4 h-4" />
              Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Address Line
                </label>
                <input
                  type="text"
                  name="addressLine"
                  value={formData.addressLine}
                  onChange={handleChange}
                  placeholder="Street / Area / Locality"
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
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
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CO-APPLICANT (OPTIONAL) */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-5">
              <Users className="w-4 h-4" />
              Co-Applicant (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Co-Applicant Name
                </label>
                <input
                  type="text"
                  name="coApplicantName"
                  value={formData.coApplicantName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Co-Applicant PAN
                </label>
                <input
                  type="text"
                  name="coApplicantPan"
                  value={formData.coApplicantPan}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Co-Applicant Aadhaar
                </label>
                <input
                  type="text"
                  name="coApplicantAadhaar"
                  value={formData.coApplicantAadhaar}
                  onChange={handleChange}
                  maxLength={12}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column — Lead Information + Actions */}
        <div className="w-80 flex-shrink-0 space-y-5">
          {/* LEAD INFORMATION */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h2 className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-5">
              <span className="text-base">📌</span>
              Lead Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Lead Source
                </label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                >
                  <option value="">-- Select --</option>
                  <option>Walk-In</option>
                  <option>Online</option>
                  <option>Referral</option>
                  <option>Advertisement</option>
                  <option>Cold Call</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Lead Stage
                </label>
                <select
                  name="leadStage"
                  value={formData.leadStage}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                >
                  <option>Lead</option>
                  <option>Contacted</option>
                  <option>Site Visit</option>
                  <option>Negotiation</option>
                  <option>Booked</option>
                  <option>Lost</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Referred By Agent
                </label>
                <select
                  name="referredByAgent"
                  value={formData.referredByAgent}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                >
                  <option value="">-- None --</option>
                  {agentNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Interested In
                </label>
                <input
                  type="text"
                  name="interestedIn"
                  value={formData.interestedIn}
                  onChange={handleChange}
                  placeholder="e.g. Residential plot 200 Sq.ft"
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Notes / Remarks
                </label>
                <textarea
                  name="notesRemarks"
                  value={formData.notesRemarks}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors resize-none"
                />
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
                : submitLabel ||
                  (mode === "create" ? "Save Customer" : "Update Customer")}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="w-full px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save &amp; Create Booking
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-full px-5 py-2.5 text-sm text-muted hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Customers
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
