"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { CreditCard, Plus, Search, X, Loader2 } from "lucide-react";
import { PaymentPlanCard } from "@/components/payment-plans/payment-plan-card";
import {
  AddPaymentPlanModal,
  EditPaymentPlanModal,
} from "@/components/payment-plans/payment-plan-form";
import { DeletePaymentPlanDialog } from "@/components/payment-plans/delete-payment-plan-dialog";
import type {
  PaymentPlan,
  InstallmentRow,
} from "@/lib/types/payment-plan";

export default function PaymentPlansPage() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PaymentPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<PaymentPlan | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/payment-plans");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPlans(data);
      setError(null);
    } catch {
      setError("Failed to load payment plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlans();
  }, [fetchPlans]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        search === "" ||
        plan.name.toLowerCase().includes(search.toLowerCase());

      const matchesSite =
        siteFilter === "All Sites" || plan.site === siteFilter;

      const matchesType =
        typeFilter === "All Types" || plan.type === typeFilter;

      return matchesSearch && matchesSite && matchesType;
    });
  }, [search, siteFilter, typeFilter, plans]);

  const handlePlanAdded = useCallback(
    async (data: {
      name: string;
      type: string;
      status: string;
      site: string;
      discount: number;
      installments: InstallmentRow[];
    }) => {
      const res = await fetch("/api/payment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create payment plan");
      }
      await fetchPlans();
    },
    [fetchPlans],
  );

  const handlePlanUpdated = useCallback(
    async (data: {
      name: string;
      type: string;
      status: string;
      site: string;
      discount: number;
      installments: InstallmentRow[];
    }) => {
      if (!editingPlan) return;
      const res = await fetch(`/api/payment-plans/${editingPlan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update payment plan");
      }
      setEditingPlan(null);
      await fetchPlans();
    },
    [editingPlan, fetchPlans],
  );

  const handleEdit = useCallback((plan: PaymentPlan) => {
    setEditingPlan(plan);
  }, []);

  const handleDelete = useCallback((plan: PaymentPlan) => {
    setDeletingPlan(plan);
  }, []);

  const handleConfirmDelete = useCallback(
    async (plan: PaymentPlan) => {
      const res = await fetch(`/api/payment-plans/${plan.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete payment plan");
      }
      setDeletingPlan(null);
      await fetchPlans();
    },
    [fetchPlans],
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Payment Plans
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Manage booking payment plans and installment schedules
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Payment Plan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Site Filter */}
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Filter by Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Sites</option>
              <option>ALAPAKKAM</option>
              <option>Trichy</option>
              <option>VANDALUR</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Filter by Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Types</option>
              <option>Full Payment</option>
              <option>Installment</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Search
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search plan name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <button className="p-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="p-2.5 text-muted hover:text-foreground hover:bg-input-bg rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Plan Count */}
          <div className="text-sm text-muted font-medium">
            {filteredPlans.length} plans
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Loader2 className="w-8 h-8 text-purple-600 mx-auto mb-3 animate-spin" />
          <p className="text-muted font-medium">Loading payment plans...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white rounded-xl border border-red-200 p-12 text-center">
          <p className="text-red-600 font-medium mb-2">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchPlans();
            }}
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Plans Grid */}
      {!loading && !error && filteredPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => (
            <PaymentPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredPlans.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-muted font-medium">No payment plans found</p>
          <p className="text-sm text-muted/60 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Add Payment Plan Modal */}
      {showAddModal && (
        <AddPaymentPlanModal
          isOpen
          onClose={() => setShowAddModal(false)}
          onPlanAdded={handlePlanAdded}
        />
      )}

      {/* Edit Payment Plan Modal */}
      {editingPlan && (
        <EditPaymentPlanModal
          key={editingPlan.id}
          isOpen
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onPlanUpdated={handlePlanUpdated}
        />
      )}

      {/* Delete Payment Plan Dialog */}
      {deletingPlan && (
        <DeletePaymentPlanDialog
          key={deletingPlan.id}
          isOpen
          plan={deletingPlan}
          onClose={() => setDeletingPlan(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
