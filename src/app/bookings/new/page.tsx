"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  MapPin,
  Map,
  List,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  User,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import type { Plot } from "@/lib/types/plot";
import { statusColors } from "@/lib/types/plot";
import type { Site } from "@/lib/types/site";
import type { Agent } from "@/lib/types/agent";
import type { PaymentPlan } from "@/lib/types/payment-plan";

interface CustomerOption {
  id: string;
  name: string;
  mobile: string;
}

const steps = [
  { id: 1, label: "Select Plot" },
  { id: 2, label: "Customer" },
  { id: 3, label: "Payment Plan" },
  { id: 4, label: "Confirm & Book" },
];

const legendColors: Record<string, string> = {
  Available: "bg-emerald-500",
  "On Hold": "bg-amber-400",
  Booked: "bg-red-400",
  Sold: "bg-gray-400",
};

export default function NewBookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1 - Plot
  const [sites, setSites] = useState<Site[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState("All Blocks");
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Step 2 - Customer / Agent
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null,
  );
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);

  // Step 3 - Payment
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? null;
  const selectedCustomer = customers.find(
    (c) => Number(c.id) === selectedCustomerId,
  );
  const selectedAgent = agents.find((a) => Number(a.id) === selectedAgentId);
  const selectedPlan = paymentPlans.find(
    (p) => Number(p.id) === selectedPlanId,
  );

  // Load sites
  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((d) => setSites(d))
      .catch(() => {});
  }, []);

  // Load plots when site selected
  useEffect(() => {
    if (!selectedSiteId) {
      setPlots([]); // eslint-disable-line react-hooks/set-state-in-effect -- reset plots when site changes
      return;
    }
    fetch("/api/plots")
      .then((r) => r.json())
      .then((d: Plot[]) => {
        const filtered = d.filter(
          (p) => p.siteId === selectedSiteId && p.status === "Available",
        );
        setPlots(filtered);
      })
      .catch(() => {
        setPlots([]);
      });
  }, [selectedSiteId]);

  // Load customers, agents, payment plans
  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) =>
        setCustomers(
          d.map((c: CustomerOption) => ({
            id: c.id,
            name: c.name,
            mobile: c.mobile,
          })),
        ),
      )
      .catch(() => {});

    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d))
      .catch(() => {});

    fetch("/api/payment-plans")
      .then((r) => r.json())
      .then((d) => setPaymentPlans(d))
      .catch(() => {});
  }, []);

  // Filter plots by block
  const filteredPlots = useMemo(() => {
    return plots.filter(
      (p) =>
        selectedBlock === "All Blocks" || p.block === selectedBlock,
    );
  }, [plots, selectedBlock]);

  // Payment plans for current site (All Sites + site-specific)
  const sitePlans = useMemo(() => {
    return paymentPlans.filter(
      (p) =>
        p.siteId === null ||
        p.siteId === selectedSiteId,
    );
  }, [paymentPlans, selectedSiteId]);

  const handlePlotClick = useCallback((plot: Plot) => {
    if (plot.status !== "Available") return;
    setSelectedPlot((prev) => (prev?.id === plot.id ? null : plot));
  }, []);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plotId: Number(selectedPlot!.id),
          customerId: selectedCustomerId,
          agentId: selectedAgentId || undefined,
          paymentPlanId: selectedPlanId || undefined,
          total,
          advance,
          date: bookingDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create booking");
        return;
      }

      router.push("/bookings/list");
    } catch {
      setError("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const balance = total - advance;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">New Booking</h1>
            <p className="text-sm text-muted mt-0.5">
              Complete all steps to create a plot booking
            </p>
          </div>
        </div>
        <Link
          href="/bookings/list"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bookings
        </Link>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-xl border border-border px-8 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div
                key={step.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium whitespace-nowrap ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                          ? "text-emerald-600"
                          : "text-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 mt-[-20px] ${
                      isCompleted ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-5">
        {/* Left: Step Content */}
        <div className="flex-1 bg-white rounded-xl border border-border p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1 */}
          {currentStep === 1 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                <MapPin className="w-4 h-4 text-blue-600" />
                Step 1 — Select a Plot
              </h2>
              <div className="border-t border-border mb-4" />
              <div className="flex items-end gap-4 mb-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Site <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSiteId ?? ""}
                    onChange={(e) => {
                      setSelectedSiteId(e.target.value ? Number(e.target.value) : null);
                      setSelectedPlot(null);
                    }}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">-- Select Site --</option>
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Block
                  </label>
                  <select
                    value={selectedBlock}
                    onChange={(e) => setSelectedBlock(e.target.value)}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                  >
                    <option>All Blocks</option>
                    <option>A</option>
                    <option>B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    View
                  </label>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode("map")}
                      className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                        viewMode === "map"
                          ? "bg-blue-600 text-white"
                          : "bg-input-bg text-muted hover:text-foreground"
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      Map
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                        viewMode === "list"
                          ? "bg-blue-600 text-white"
                          : "bg-input-bg text-muted hover:text-foreground"
                      }`}
                    >
                      <List className="w-4 h-4" />
                      List
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4 text-sm">
                {Object.entries(legendColors).map(([label, color]) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-sm ${color}`} />
                    {label}
                  </span>
                ))}
              </div>
              <div className="border border-border rounded-lg p-4 min-h-[200px]">
                {!selectedSiteId ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-muted/30 mb-3" />
                    <p className="text-sm text-muted">
                      Select a site to view plot layout
                    </p>
                  </div>
                ) : filteredPlots.length > 0 ? (
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {filteredPlots.map((plot) => {
                      const isSelected = selectedPlot?.id === plot.id;
                      const isAvailable = plot.status === "Available";
                      return (
                        <button
                          key={plot.id}
                          onClick={() => handlePlotClick(plot)}
                          disabled={!isAvailable}
                          className={`${statusColors[plot.status]} text-white rounded-lg p-2 flex flex-col items-center justify-center text-center min-h-[50px] transition-all ${
                            isAvailable
                              ? "cursor-pointer hover:ring-2 hover:ring-white hover:ring-offset-1"
                              : "opacity-60 cursor-not-allowed"
                          } ${isSelected ? "ring-2 ring-white ring-offset-2 scale-105" : ""}`}
                        >
                          <span className="text-xs font-bold leading-tight">
                            {plot.code}
                          </span>
                          <span className="text-[9px] leading-tight opacity-90">
                            {plot.area} {plot.areaUnit}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ClipboardList className="w-12 h-12 text-muted/30 mb-3" />
                    <p className="text-sm text-muted">
                      No available plots found for this site/block
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                <User className="w-4 h-4 text-blue-600" />
                Step 2 — Customer Details
              </h2>
              <div className="border-t border-border mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCustomerId ?? ""}
                    onChange={(e) =>
                      setSelectedCustomerId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.mobile})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Agent
                  </label>
                  <select
                    value={selectedAgentId ?? ""}
                    onChange={(e) =>
                      setSelectedAgentId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">-- Select Agent (Optional) --</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Step 3 — Payment Plan
              </h2>
              <div className="border-t border-border mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Payment Plan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedPlanId ?? ""}
                    onChange={(e) =>
                      setSelectedPlanId(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">-- Select Plan --</option>
                    {sitePlans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Total Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={total || ""}
                    onChange={(e) => setTotal(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Advance Amount
                  </label>
                  <input
                    type="number"
                    value={advance || ""}
                    onChange={(e) => setAdvance(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                Step 4 — Confirm & Book
              </h2>
              <div className="border-t border-border mb-4" />
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Site</span>
                  <span className="font-medium text-foreground">
                    {selectedSite?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Plot</span>
                  <span className="font-medium text-foreground">
                    {selectedPlot?.code || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Area</span>
                  <span className="font-medium text-foreground">
                    {selectedPlot
                      ? `${selectedPlot.area} ${selectedPlot.areaUnit}`
                      : "—"}
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Customer</span>
                  <span className="font-medium text-foreground">
                    {selectedCustomer?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Mobile</span>
                  <span className="font-medium text-foreground">
                    {selectedCustomer?.mobile || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Agent</span>
                  <span className="font-medium text-foreground">
                    {selectedAgent?.name || "—"}
                  </span>
                </div>
                <div className="border-t border-border" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Payment Plan</span>
                  <span className="font-medium text-foreground">
                    {selectedPlan?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total Amount</span>
                  <span className="font-medium text-foreground">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Advance</span>
                  <span className="font-medium text-blue-600">
                    ₹{advance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Balance</span>
                  <span className="font-medium text-red-500">
                    ₹{Math.max(0, balance).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Booking Date</span>
                  <span className="font-medium text-foreground">
                    {bookingDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nav Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-5 py-2.5 bg-white border border-border text-foreground text-sm font-medium rounded-lg hover:bg-input-bg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !selectedPlot) ||
                  (currentStep === 2 && !selectedCustomerId)
                }
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: {steps[currentStep]?.label || "Done"}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                {submitting ? "Booking..." : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>

        {/* Right: Booking Summary */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Booking Summary
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Site</span>
                <span className="font-medium text-foreground">
                  {selectedSite?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Plot</span>
                <span className="font-medium text-foreground">
                  {selectedPlot?.code || "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Area</span>
                <span className="font-medium text-foreground">
                  {selectedPlot
                    ? `${selectedPlot.area} ${selectedPlot.areaUnit}`
                    : "—"}
                </span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted">Customer</span>
                <span className="font-medium text-foreground">
                  {selectedCustomer?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Agent</span>
                <span className="font-medium text-foreground">
                  {selectedAgent?.name || "—"}
                </span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted">Total Amount</span>
                <span className="font-medium text-foreground">
                  {total > 0 ? `₹${total.toLocaleString("en-IN")}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Advance</span>
                <span className="font-medium text-blue-600">
                  {advance > 0 ? `₹${advance.toLocaleString("en-IN")}` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Balance</span>
                <span className="font-medium text-red-500">
                  {total > 0
                    ? `₹${Math.max(0, balance).toLocaleString("en-IN")}`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
