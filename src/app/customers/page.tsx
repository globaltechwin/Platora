"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  X,
  Pencil,
  Phone,
  CreditCard,
  FileText,
  Trash2,
  Loader2,
} from "lucide-react";
import { type Customer } from "@/lib/types/customer";

const stageStyles: Record<string, string> = {
  "New Lead": "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  "Site Visit": "bg-purple-100 text-purple-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Booked: "bg-blue-100 text-blue-700",
  Lost: "bg-red-100 text-red-600",
};

const leadStages = [
  "All Stages",
  "New Lead",
  "Contacted",
  "Site Visit",
  "Negotiation",
  "Booked",
  "Lost",
];

const leadStatuses = [
  "All",
  "New Lead",
  "Contacted",
  "Site Visit",
  "Negotiation",
  "Booked",
  "Lost",
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch("/api/customers");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCustomers(data);
      setError(null);
    } catch {
      setError("Failed to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesStage =
        stageFilter === "All Stages" || c.stage === stageFilter;

      const matchesStatus =
        statusFilter === "All" || c.stage === statusFilter;

      const matchesSearch =
        search === "" ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.mobile.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase());

      return matchesStage && matchesStatus && matchesSearch;
    });
  }, [customers, stageFilter, statusFilter, search]);

  const handleDelete = useCallback(
    async (customer: Customer) => {
      if (!confirm(`Delete customer "${customer.name}"?`)) return;
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete customer");
        return;
      }
      await fetchCustomers();
    },
    [fetchCustomers],
  );

  const startIdx = filteredCustomers.length > 0 ? 1 : 0;
  const endIdx = filteredCustomers.length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Customers / Leads
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Manage customer records and lead pipeline
            </p>
          </div>
        </div>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Lead Stage */}
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Lead Stage
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              {leadStages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Lead Status */}
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Lead Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              {leadStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
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
                  placeholder="Name / mobile / email / code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <button className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
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
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-muted font-medium">Loading customers...</p>
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
              fetchCustomers();
            }}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Customers Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Table Header Bar */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Customers</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {filteredCustomers.length}
            </span>
          </div>

          {/* Table */}
          {filteredCustomers.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        #
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Code
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Name
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Lead Source
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Stage
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Registered On
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer, idx) => (
                      <tr
                        key={customer.id}
                        className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                            {customer.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {customer.name}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {customer.mobile}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {customer.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {customer.leadSource || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${stageStyles[customer.stage]}`}
                          >
                            {customer.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {customer.referredByAgentName || "—"}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {customer.registeredOn}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <Phone className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors">
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(customer)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-border">
                <p className="text-sm text-muted">
                  Showing {startIdx} – {endIdx} of {filteredCustomers.length}
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted/30 mx-auto mb-3" />
              <p className="text-muted font-medium">No customers found</p>
              <p className="text-sm text-muted/60 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
