"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart3,
  Search,
  X,
  Download,
  Grid,
  Table,
} from "lucide-react";

interface AgentPerformance {
  id: number;
  agentCode: string;
  agentName: string;
  bookings: number;
  value: number;
  commission: number;
  pendingCommission: number;
}

export default function AgentPerformancePage() {
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  useEffect(() => {
    fetch("/api/reports/agent-performance")
      .then((r) => r.json())
      .then((d) => {
        setAgents(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const uniqueAgents = useMemo(
    () => [...new Set(agents.map((a) => a.agentName))].sort(),
    [agents],
  );

  const filteredAgents = useMemo(() => {
    return agents.filter((a) => {
      const matchesAgent =
        agentFilter === "All Agents" || a.agentName === agentFilter;
      return matchesAgent;
    });
  }, [agents, agentFilter]);

  const handleClear = useCallback(() => {
    setAgentFilter("All Agents");
    setSiteFilter("All Sites");
    setFromDate("");
    setToDate("");
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const formatFullCurrency = (amount: number) => {
    return `₹ ${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Agent Performance Report
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Sales performance and commission summary by agent
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Agent
            </label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Agents</option>
              {uniqueAgents.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Sites</option>
            </select>
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
            />
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={handleClear}
              className="p-2.5 text-muted hover:text-foreground hover:bg-input-bg rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("card")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "card"
              ? "bg-blue-600 text-white"
              : "bg-white border border-border text-muted hover:text-foreground"
          }`}
        >
          <Grid className="w-4 h-4" />
          Card View
        </button>
        <button
          onClick={() => setViewMode("table")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === "table"
              ? "bg-blue-600 text-white"
              : "bg-white border border-border text-muted hover:text-foreground"
          }`}
        >
          <Table className="w-4 h-4" />
          Table View
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-muted">Loading agent performance...</p>
        </div>
      ) : (
        <>
          {/* Card View */}
          {viewMode === "card" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredAgents.map((agent, idx) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
                >
                  {/* Agent Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-700">
                        {idx + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {agent.agentName}
                      </h3>
                      <p className="text-xs text-muted">{agent.agentCode}</p>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {agent.bookings}
                      </p>
                      <p className="text-xs text-muted">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(agent.value)}
                      </p>
                      <p className="text-xs text-muted">Value</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-amber-600">
                        {formatFullCurrency(agent.commission)}
                      </p>
                      <p className="text-xs text-muted">Commission</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-red-500">
                        {formatFullCurrency(agent.pendingCommission)}
                      </p>
                      <p className="text-xs text-muted">Pending Comm.</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${agent.bookings > 0 ? Math.min((agent.value / 10000000) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
                <h2 className="text-sm font-bold text-foreground">
                  Agent Performance
                </h2>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {filteredAgents.length}
                </span>
              </div>

              {filteredAgents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-gray-50/50">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          #
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          Agent Code
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          Agent Name
                        </th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          Bookings
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          Value (₹)
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          Commission (₹)
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                          Pending Comm. (₹)
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
                          <td className="px-4 py-3 text-blue-600 font-medium">
                            {agent.agentCode}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {agent.agentName}
                          </td>
                          <td className="px-4 py-3 text-center text-foreground font-medium">
                            {agent.bookings}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground font-medium">
                            {formatFullCurrency(agent.value)}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {formatFullCurrency(agent.commission)}
                          </td>
                          <td className="px-4 py-3 text-right text-red-500 font-medium">
                            {formatFullCurrency(agent.pendingCommission)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <BarChart3 className="w-12 h-12 text-muted/30 mx-auto mb-3" />
                  <p className="text-muted font-medium">No agents found</p>
                  <p className="text-sm text-muted/60 mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
