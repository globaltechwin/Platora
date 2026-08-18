"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Search,
  X,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Loader2,
} from "lucide-react";
import { SiteCard } from "@/components/sites/site-card";
import { AddSiteModal } from "@/components/sites/add-site-modal";
import { EditSiteModal } from "@/components/sites/edit-site-modal";
import { DeleteSiteDialog } from "@/components/sites/delete-site-dialog";
import type { Site } from "@/lib/types/site";
import type { SiteFormData } from "@/components/sites/site-form";

async function fetchSitesApi(): Promise<Site[]> {
  const res = await fetch("/api/sites");
  if (!res.ok) throw new Error("Failed to fetch sites");
  return res.json();
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [zoningFilter, setZoningFilter] = useState("All Zones");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);
  const mountedRef = useRef(true);

  const loadSites = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchSitesApi();
      if (mountedRef.current) setSites(data);
    } catch (err) {
      if (mountedRef.current)
        setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSites();
    return () => {
      mountedRef.current = false;
    };
  }, [loadSites]);

  const filteredSites = useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch =
        search === "" ||
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.code.toLowerCase().includes(search.toLowerCase()) ||
        site.city.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All Status" || site.status === statusFilter;

      const matchesZoning =
        zoningFilter === "All Zones" || site.zoning === zoningFilter;

      return matchesSearch && matchesStatus && matchesZoning;
    });
  }, [search, statusFilter, zoningFilter, sites]);

  const handleSiteAdded = useCallback(
    async (data: SiteFormData) => {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create site");
      }
      await loadSites();
    },
    [loadSites],
  );

  const handleSiteUpdated = useCallback(
    async (data: SiteFormData) => {
      if (!editingSite) return;
      const res = await fetch(`/api/sites/${editingSite.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update site");
      }
      setEditingSite(null);
      await loadSites();
    },
    [editingSite, loadSites],
  );

  const handleEdit = useCallback((site: Site) => {
    setEditingSite(site);
  }, []);

  const handleDelete = useCallback((site: Site) => {
    setDeletingSite(site);
  }, []);

  const handleConfirmDelete = useCallback(
    async (site: Site) => {
      const res = await fetch(`/api/sites/${site.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete site");
      }
      setDeletingSite(null);
      await loadSites();
    },
    [loadSites],
  );

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Site Management
          </h1>
          <p className="text-sm text-muted mt-1">
            Add, edit and manage real estate site / project records
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Site
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Search
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Site name / code / city..."
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
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          {/* Zoning Filter */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Zoning
            </label>
            <select
              value={zoningFilter}
              onChange={(e) => setZoningFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Zones</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Agricultural</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="w-full md:w-auto">
            <label className="block text-xs font-medium text-muted mb-1.5">
              View
            </label>
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-input-bg text-muted hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-input-bg text-muted hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-muted font-medium">Loading sites...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <X className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-muted font-medium">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              loadSites();
            }}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Sites Grid */}
      {!loading && !error && filteredSites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredSites.map((site) => (
            <SiteCard
              key={site.id}
              site={site}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredSites.length === 0 && (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <MapPin className="w-12 h-12 text-muted/30 mx-auto mb-3" />
          <p className="text-muted font-medium">No sites found</p>
          <p className="text-sm text-muted/60 mt-1">
            {sites.length === 0
              ? "Add your first site to get started"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddModal && (
        <AddSiteModal
          isOpen
          onClose={() => setShowAddModal(false)}
          onSiteAdded={handleSiteAdded}
        />
      )}

      {/* Edit Site Modal */}
      {editingSite && (
        <EditSiteModal
          key={editingSite.id}
          isOpen
          site={editingSite}
          onClose={() => setEditingSite(null)}
          onSiteUpdated={handleSiteUpdated}
        />
      )}

      {/* Delete Site Dialog */}
      {deletingSite && (
        <DeleteSiteDialog
          key={deletingSite.id}
          isOpen
          site={deletingSite}
          onClose={() => setDeletingSite(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
