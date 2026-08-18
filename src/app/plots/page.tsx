"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Map,
  MapPin,
  List,
  Plus,
  CalendarPlus,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Info,
  Loader2,
} from "lucide-react";
import {
  statusColors,
  type Plot,
  type PlotStatus,
} from "@/lib/types/plot";
import { AddPlotModal } from "@/components/plots/plot-form";

const allBlocks = ["All Blocks", "A", "B", "C", "D"];
const allStatuses: PlotStatus[] = [
  "Available",
  "Blocked",
  "Booked",
  "Registered",
  "Sold",
  "Blocked (Admin)",
];
const allFacings = ["All Facing", "North", "South", "East", "West"];

export default function PlotsPage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [blockFilter, setBlockFilter] = useState("All Blocks");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [facingFilter, setFacingFilter] = useState("All Facing");
  const [search, setSearch] = useState("");
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlots = useCallback(async () => {
    try {
      const [plotsRes, sitesRes] = await Promise.all([
        fetch("/api/plots"),
        fetch("/api/sites"),
      ]);
      if (!plotsRes.ok) throw new Error("Failed to fetch plots");
      const plotsData = await plotsRes.json();
      setPlots(plotsData);

      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        const names = sitesData.map((s: { name: string }) => s.name);
        setSites(names);
      }
      setError(null);
    } catch {
      setError("Failed to load plots. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlots();
  }, [fetchPlots]);

  const allSiteOptions = useMemo(
    () => ["All Sites", ...sites],
    [sites],
  );

  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      const matchesSite =
        siteFilter === "All Sites" || plot.siteName === siteFilter;
      const matchesBlock =
        blockFilter === "All Blocks" || plot.block === blockFilter;
      const matchesStatus =
        statusFilter === "All Status" || plot.status === statusFilter;
      const matchesFacing =
        facingFilter === "All Facing" || plot.facing === facingFilter;
      const matchesSearch =
        search === "" ||
        plot.code.toLowerCase().includes(search.toLowerCase());
      return matchesSite && matchesBlock && matchesStatus && matchesFacing && matchesSearch;
    });
  }, [siteFilter, blockFilter, statusFilter, facingFilter, search, plots]);

  const stats = useMemo(() => {
    const total = filteredPlots.length;
    const available = filteredPlots.filter((p) => p.status === "Available").length;
    const booked = filteredPlots.filter((p) => p.status === "Booked").length;
    const sold = filteredPlots.filter((p) => p.status === "Sold").length;
    return { total, available, booked, sold };
  }, [filteredPlots]);

  const handlePlotClick = useCallback((plot: Plot) => {
    setSelectedPlot((prev) => (prev?.id === plot.id ? null : plot));
  }, []);

  const handlePlotAdded = useCallback(
    async (data: {
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
    }) => {
      // Refetch from API after plots are created
      await fetchPlots();
      void data;
    },
    [fetchPlots],
  );

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Map className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Plot Layout</h1>
            <p className="text-sm text-muted mt-0.5">
              Interactive site map — click any plot to view details and take
              action
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-white border border-border text-foreground"
                  : "bg-input-bg text-muted hover:text-foreground"
              }`}
            >
              <Map className="w-4 h-4" />
              Map
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white border border-border text-foreground"
                  : "bg-input-bg text-muted hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Plots
          </button>
          <Link
            href="/bookings/new"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            New Booking
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              {allSiteOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Block
            </label>
            <select
              value={blockFilter}
              onChange={(e) => setBlockFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              {allBlocks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Status</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Facing
            </label>
            <select
              value={facingFilter}
              onChange={(e) => setFacingFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              {allFacings.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              Search Plot
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Plot code or number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend & Stats */}
      <div className="bg-white rounded-xl border border-border px-4 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            Legend :
          </span>
          {(
            [
              ["Available", "bg-emerald-500"],
              ["Blocked", "bg-orange-500"],
              ["Booked", "bg-blue-500"],
              ["Registered", "bg-purple-500"],
              ["Sold", "bg-red-500"],
              ["Blocked (Admin)", "bg-gray-400"],
            ] as const
          ).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5 text-sm">
              <span className={`w-3 h-3 rounded-sm ${color}`} />
              {label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-muted">
            {stats.total} Total |
          </span>
          <span className="text-emerald-600">
            {stats.available} Available |
          </span>
          <span className="text-blue-600">
            {stats.booked} Booked |
          </span>
          <span className="text-red-600">{stats.sold} Sold</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
          <p className="text-muted font-medium">Loading plots...</p>
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
              fetchPlots();
            }}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content: Grid + Details Panel */}
      {!loading && !error && (
        <div className="flex gap-4 min-h-[500px]">
          {/* Plot Grid */}
          <div className="flex-1 bg-white rounded-xl border border-border p-4 relative overflow-auto">
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(10, minmax(0, 1fr))`,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              {filteredPlots.map((plot) => {
                const isSelected = selectedPlot?.id === plot.id;
                return (
                  <button
                    key={plot.id}
                    onClick={() => handlePlotClick(plot)}
                    className={`
                      ${statusColors[plot.status]} text-white
                      rounded-lg p-2 flex flex-col items-center justify-center
                      text-center min-h-[60px] transition-all cursor-pointer
                      hover:ring-2 hover:ring-white hover:ring-offset-1 hover:ring-opacity-50
                      ${isSelected ? "ring-2 ring-white ring-offset-2 ring-opacity-100 scale-105" : ""}
                    `}
                  >
                    <span className="text-xs font-bold leading-tight">
                      {plot.code}
                    </span>
                    <span className="text-[10px] leading-tight opacity-90">
                      {plot.area} {plot.areaUnit}
                    </span>
                  </button>
                );
              })}
            </div>

            {filteredPlots.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <MapPin className="w-12 h-12 text-muted/30 mb-3" />
                <p className="text-muted font-medium">No plots found</p>
                <p className="text-sm text-muted/60 mt-1">
                  Try adjusting your filters or add new plots
                </p>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
              <button
                onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
                className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
                className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="w-8 h-8 bg-white border border-border rounded-lg flex items-center justify-center text-muted hover:text-foreground hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Crosshair className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Plot Details Panel */}
          <div className="w-80 bg-white rounded-xl border border-border overflow-hidden flex-shrink-0">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4" />
                Plot Details
              </h2>
            </div>
            <div className="p-6">
              {selectedPlot ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground text-lg">
                      {selectedPlot.code}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-md text-white ${statusColors[selectedPlot.status]}`}
                    >
                      {selectedPlot.status}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Block</span>
                      <span className="font-medium text-foreground">
                        {selectedPlot.block}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Area</span>
                      <span className="font-medium text-foreground">
                        {selectedPlot.area} {selectedPlot.areaUnit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Facing</span>
                      <span className="font-medium text-foreground">
                        {selectedPlot.facing}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Site</span>
                      <span className="font-medium text-foreground">
                        {selectedPlot.siteName}
                      </span>
                    </div>
                    {selectedPlot.type && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Type</span>
                        <span className="font-medium text-foreground">
                          {selectedPlot.type}
                        </span>
                      </div>
                    )}
                    {selectedPlot.dimensions && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Dimensions</span>
                        <span className="font-medium text-foreground">
                          {selectedPlot.dimensions}
                        </span>
                      </div>
                    )}
                    {selectedPlot.ratePerSqft != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">Rate / Sq.ft</span>
                        <span className="font-medium text-foreground">
                          ₹{selectedPlot.ratePerSqft.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedPlot.plcCharges != null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">PLC Charges</span>
                        <span className="font-medium text-foreground">
                          ₹{selectedPlot.plcCharges.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MapPin className="w-12 h-12 text-muted/30 mb-3" />
                  <p className="text-sm text-muted">
                    Click on a plot to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Plot Modal */}
      {showAddModal && (
        <AddPlotModal
          isOpen
          initialSite={siteFilter === "All Sites" ? sites[0] || "ALAPAKKAM" : siteFilter}
          onClose={() => setShowAddModal(false)}
          onPlotAdded={handlePlotAdded}
        />
      )}
    </div>
  );
}
