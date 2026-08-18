"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  X,
  Pencil,
  CreditCard,
  Trash2,
  Loader2,
} from "lucide-react";
import { type Agent } from "@/lib/types/agent";

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/agents");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAgents(data);
      setError(null);
    } catch {
      setError("Failed to load agents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAgents();
  }, [fetchAgents]);

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const matchesStatus =
        statusFilter === "All" || a.status === statusFilter;

      const matchesSearch =
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.code.toLowerCase().includes(search.toLowerCase()) ||
        a.mobile.toLowerCase().includes(search.toLowerCase()) ||
        a.pan.toLowerCase().includes(search.toLowerCase()) ||
        a.reraNo.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [agents, statusFilter, search]);

  const handleDelete = useCallback(
    async (agent: Agent) => {
      if (!confirm(`Delete agent "${agent.name}"?`)) return;
      const res = await fetch(`/api/agents/${agent.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete agent");
        return;
      }
      await fetchAgents();
    },
    [fetchAgents],
  );

  const startIdx = filteredAgents.length > 0 ? 1 : 0;
  const endIdx = filteredAgents.length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Agents / Brokers
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Manage agent profiles, commissions and performance
          </p>
        </div>
        <Link
          href="/agents/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Agent
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Status Filter */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
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
                  placeholder="Name / code / mobile / PAN / RERA..."
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
          <p className="text-muted font-medium">Loading agents...</p>
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
              fetchAgents();
            }}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Agents Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Table Header Bar */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground">Agents</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {filteredAgents.length}
            </span>
          </div>

          {/* Table */}
          {filteredAgents.length > 0 ? (
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
                        PAN
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        RERA No.
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Commission (₹/Sq.ft)
                      </th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent, idx) => (
                      <tr
                        key={agent.id}
                        className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                            {agent.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {agent.name}
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {agent.mobile}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {agent.email || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {agent.pan || "—"}
                        </td>
                        <td className="px-4 py-3 text-muted">
                          {agent.reraNo || "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground font-medium">
                          ₹ {agent.commission.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center text-foreground font-medium">
                          {agent.bookings}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[agent.status]}`}
                          >
                            {agent.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-foreground">
                          {agent.joined}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors">
                              <CreditCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(agent)}
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
                  Showing {startIdx} – {endIdx} of {filteredAgents.length}{" "}
                  agent(s)
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted/30 mx-auto mb-3" />
              <p className="text-muted font-medium">No agents found</p>
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
