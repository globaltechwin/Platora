"use client";

import { useState } from "react";
import {
  MapPin,
  Pencil,
  Grid3X3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import type { Site } from "@/lib/types/site";

interface SiteCardProps {
  site: Site;
  onEdit?: (site: Site) => void;
  onDelete?: (site: Site) => void;
}

export function SiteCard({ site, onEdit, onDelete }: SiteCardProps) {
  const [showBlocks, setShowBlocks] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-bold text-foreground">{site.name}</h3>
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md">
            {site.status}
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
            <Tag className="w-3 h-3" />
            {site.code}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
            {site.zoning}
          </span>
        </div>

        {/* Location & Details */}
        <div className="flex items-center gap-1 text-xs text-muted mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {site.city}, {site.state}
          </span>
          <span className="mx-1">&middot;</span>
          <span>
            {site.area.toFixed(2)} {site.areaUnit}
          </span>
          <span className="mx-1">&middot;</span>
          <span className="text-amber-600 font-medium">{site.rera}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 pb-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center py-2 rounded-lg bg-blue-50 border border-blue-100">
            <div className="text-xl font-bold text-blue-600">{site.totalPlots}</div>
            <div className="text-[10px] text-blue-500 font-medium">Total</div>
          </div>
          <div className="text-center py-2 rounded-lg bg-emerald-50 border border-emerald-100">
            <div className="text-xl font-bold text-emerald-600">{site.availablePlots}</div>
            <div className="text-[10px] text-emerald-500 font-medium">Available</div>
          </div>
          <div className="text-center py-2 rounded-lg bg-amber-50 border border-amber-100">
            <div className="text-xl font-bold text-amber-600">{site.bookedPlots}</div>
            <div className="text-[10px] text-amber-500 font-medium">Booked</div>
          </div>
          <div className="text-center py-2 rounded-lg bg-gray-50 border border-gray-200">
            <div className="text-xl font-bold text-gray-500">{site.soldPlots}</div>
            <div className="text-[10px] text-gray-400 font-medium">Sold</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div
              className="bg-emerald-500 h-full"
              style={{
                width: `${
                  site.totalPlots > 0
                    ? (site.availablePlots / site.totalPlots) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="bg-amber-500 h-full"
              style={{
                width: `${
                  site.totalPlots > 0
                    ? (site.bookedPlots / site.totalPlots) * 100
                    : 0
                }%`,
              }}
            />
            <div
              className="bg-red-500 h-full"
              style={{
                width: `${
                  site.totalPlots > 0
                    ? (site.soldPlots / site.totalPlots) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <button
          onClick={() => onEdit?.(site)}
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </button>
        <button className="flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:bg-purple-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
          <Grid3X3 className="w-4 h-4" />
          Plots
        </button>
        <button
          onClick={() => onDelete?.(site)}
          className="text-sm text-red-500 hover:bg-red-500 hover:text-white p-1.5 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Blocks Expandable */}
      <div className="border-t border-border">
        <button
          onClick={() => setShowBlocks(!showBlocks)}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-muted" />
            Blocks
          </span>
          {showBlocks ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </button>
        {showBlocks && (
          <div className="px-5 pb-4 text-sm text-muted">
            No blocks configured yet.
          </div>
        )}
      </div>
    </div>
  );
}
