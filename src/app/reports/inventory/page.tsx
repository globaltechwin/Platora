"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Package,
  Search,
  X,
  Download,
  Grid,
  CheckCircle,
  Pause,
  Bookmark,
  Tag,
  Map,
} from "lucide-react";

type InventoryStatus = "Available" | "OnHold" | "Booked" | "Sold";

interface InventoryPlot {
  id: number;
  site: string;
  block: string;
  plotNo: string;
  type: string;
  facing: string;
  area: number;
  ratePerSqft: number;
  value: number;
  status: InventoryStatus;
  customerName?: string;
}

const statusStyles: Record<InventoryStatus, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  OnHold: "bg-amber-100 text-amber-700",
  Booked: "bg-red-100 text-red-600",
  Sold: "bg-gray-100 text-gray-600",
};

const summaryCardStyles: Record<
  string,
  { bg: string; icon: string; text: string }
> = {
  total: { bg: "bg-blue-50", icon: "text-blue-500", text: "text-blue-700" },
  available: {
    bg: "bg-emerald-50",
    icon: "text-emerald-500",
    text: "text-emerald-700",
  },
  onHold: {
    bg: "bg-amber-50",
    icon: "text-amber-500",
    text: "text-amber-700",
  },
  booked: { bg: "bg-red-50", icon: "text-red-500", text: "text-red-600" },
  sold: {
    bg: "bg-gray-50",
    icon: "text-gray-400",
    text: "text-gray-600",
  },
  totalArea: {
    bg: "bg-purple-50",
    icon: "text-purple-500",
    text: "text-purple-700",
  },
};

export default function InventoryReportPage() {
  const [plots, setPlots] = useState<InventoryPlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [blockFilter, setBlockFilter] = useState("All Blocks");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [plotTypeFilter, setPlotTypeFilter] = useState("All Types");

  useEffect(() => {
    fetch("/api/reports/inventory")
      .then((r) => r.json())
      .then((d) => {
        setPlots(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const uniqueSites = useMemo(
    () => [...new Set(plots.map((p) => p.site))].sort(),
    [plots],
  );
  const uniqueBlocks = useMemo(
    () =>
      [...new Set(plots.map((p) => p.block).filter((b) => b !== "—"))].sort(),
    [plots],
  );
  const uniqueTypes = useMemo(
    () =>
      [...new Set(plots.map((p) => p.type).filter((t) => t !== "—"))].sort(),
    [plots],
  );

  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      const matchesSite =
        siteFilter === "All Sites" || p.site === siteFilter;
      const matchesBlock =
        blockFilter === "All Blocks" || p.block === blockFilter;
      const matchesStatus =
        statusFilter === "All Status" || p.status === statusFilter;
      const matchesType =
        plotTypeFilter === "All Types" || p.type === plotTypeFilter;
      return matchesSite && matchesBlock && matchesStatus && matchesType;
    });
  }, [plots, siteFilter, blockFilter, statusFilter, plotTypeFilter]);

  const stats = useMemo(() => {
    const total = filteredPlots.length;
    const available = filteredPlots.filter(
      (p) => p.status === "Available",
    ).length;
    const onHold = filteredPlots.filter((p) => p.status === "OnHold").length;
    const booked = filteredPlots.filter((p) => p.status === "Booked").length;
    const sold = filteredPlots.filter((p) => p.status === "Sold").length;
    const totalArea = filteredPlots.reduce((sum, p) => sum + p.area, 0);
    return { total, available, onHold, booked, sold, totalArea };
  }, [filteredPlots]);

  const handleClear = useCallback(() => {
    setSiteFilter("All Sites");
    setBlockFilter("All Blocks");
    setStatusFilter("All Status");
    setPlotTypeFilter("All Types");
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Inventory Report
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Plot inventory status across all sites
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
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Sites</option>
              {uniqueSites.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Block
            </label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Blocks</option>
              {uniqueBlocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Status</option>
              <option>Available</option>
              <option>OnHold</option>
              <option>Booked</option>
              <option>Sold</option>
            </select>
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Plot Type
            </label>
            <select
              value={plotTypeFilter}
              onChange={(e) => setPlotTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div
          className={`${summaryCardStyles.total.bg} rounded-xl p-4 flex items-center gap-3`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${summaryCardStyles.total.bg}`}
          >
            <Grid className={`w-5 h-5 ${summaryCardStyles.total.icon}`} />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${summaryCardStyles.total.text}`}
            >
              {stats.total}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Plots
            </p>
          </div>
        </div>
        <div
          className={`${summaryCardStyles.available.bg} rounded-xl p-4 flex items-center gap-3`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${summaryCardStyles.available.bg}`}
          >
            <CheckCircle
              className={`w-5 h-5 ${summaryCardStyles.available.icon}`}
            />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${summaryCardStyles.available.text}`}
            >
              {stats.available}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Available
            </p>
          </div>
        </div>
        <div
          className={`${summaryCardStyles.onHold.bg} rounded-xl p-4 flex items-center gap-3`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${summaryCardStyles.onHold.bg}`}
          >
            <Pause className={`w-5 h-5 ${summaryCardStyles.onHold.icon}`} />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${summaryCardStyles.onHold.text}`}
            >
              {stats.onHold}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              On Hold
            </p>
          </div>
        </div>
        <div
          className={`${summaryCardStyles.booked.bg} rounded-xl p-4 flex items-center gap-3`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${summaryCardStyles.booked.bg}`}
          >
            <Bookmark
              className={`w-5 h-5 ${summaryCardStyles.booked.icon}`}
            />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${summaryCardStyles.booked.text}`}
            >
              {stats.booked}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Booked
            </p>
          </div>
        </div>
        <div
          className={`${summaryCardStyles.sold.bg} rounded-xl p-4 flex items-center gap-3`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${summaryCardStyles.sold.bg}`}
          >
            <Tag className={`w-5 h-5 ${summaryCardStyles.sold.icon}`} />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${summaryCardStyles.sold.text}`}
            >
              {stats.sold}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Sold
            </p>
          </div>
        </div>
        <div
          className={`${summaryCardStyles.totalArea.bg} rounded-xl p-4 flex items-center gap-3`}
        >
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${summaryCardStyles.totalArea.bg}`}
          >
            <Map className={`w-5 h-5 ${summaryCardStyles.totalArea.icon}`} />
          </div>
          <div>
            <p
              className={`text-2xl font-bold ${summaryCardStyles.totalArea.text}`}
            >
              {formatNumber(stats.totalArea)}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Area (Sq.ft)
            </p>
          </div>
        </div>
      </div>

      {/* Plot Inventory Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">
            Plot Inventory
          </h2>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {filteredPlots.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted">Loading inventory...</p>
          </div>
        ) : filteredPlots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Site
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Block
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Plot No.
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Facing
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Area (Sq.ft)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Rate/Sq.ft (₹)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Value (₹)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPlots.map((plot, idx) => (
                  <tr
                    key={plot.id}
                    className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3 text-foreground">{plot.site}</td>
                    <td className="px-4 py-3 text-foreground">{plot.block}</td>
                    <td className="px-4 py-3">
                      <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                        {plot.plotNo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{plot.type}</td>
                    <td className="px-4 py-3 text-foreground">
                      {plot.facing}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {plot.area.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {plot.ratePerSqft.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">
                      {formatCurrency(plot.value)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[plot.status]}`}
                        >
                          {plot.status === "OnHold" ? "OnHold" : plot.status}
                        </span>
                        {plot.customerName && (
                          <p className="text-xs text-muted mt-0.5">
                            {plot.customerName}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-muted font-medium">No plots found</p>
            <p className="text-sm text-muted/60 mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
