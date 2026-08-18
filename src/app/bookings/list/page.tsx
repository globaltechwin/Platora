"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  X,
  Trash2,
  Download,
} from "lucide-react";
import type { Booking } from "@/lib/types/booking";

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function BookingListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        setBookings(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const siteNames = useMemo(() => {
    const names = new Set(bookings.map((b) => b.siteName));
    return Array.from(names).sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSite =
        siteFilter === "All Sites" || b.siteName === siteFilter;

      const matchesStatus =
        statusFilter === "All Status" || b.status === statusFilter;

      const matchesSearch =
        search === "" ||
        b.bookingNo.toLowerCase().includes(search.toLowerCase()) ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        b.plotCode.toLowerCase().includes(search.toLowerCase());

      let matchesDate = true;
      if (fromDate) {
        const bookingDate = parseBookingDate(b.date);
        const from = new Date(fromDate);
        if (bookingDate < from) matchesDate = false;
      }
      if (toDate) {
        const bookingDate = parseBookingDate(b.date);
        const to = new Date(toDate);
        if (bookingDate > to) matchesDate = false;
      }

      return matchesSite && matchesStatus && matchesSearch && matchesDate;
    });
  }, [bookings, siteFilter, statusFilter, search, fromDate, toDate]);

  const handleDelete = useCallback(async (booking: Booking) => {
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id ? { ...b, status: "Cancelled" as const } : b,
          ),
        );
      }
    } catch {
      // silently fail
    }
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const startIdx = filteredBookings.length > 0 ? 1 : 0;
  const endIdx = filteredBookings.length;

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Booking List
            </h1>
            <p className="text-sm text-muted mt-0.5">
              All plot bookings across sites
            </p>
          </div>
        </div>
        <Link
          href="/bookings/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* Site Filter */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Site
            </label>
            <select
              value={siteFilter}
              onChange={(e) => setSiteFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Sites</option>
              {siteNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
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
              <option>Confirmed</option>
              <option>Cancelled</option>
            </select>
          </div>

          {/* From Date */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
            />
          </div>

          {/* To Date */}
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              To
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors"
            />
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
                  placeholder="Booking no, customer, plot"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-white transition-colors"
                />
              </div>
              <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-foreground">Bookings</h2>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {filteredBookings.length}
            </span>
          </div>
          <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted">Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      #
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Booking No.
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Site / Plot
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Total (₹)
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Paid (₹)
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Balance (₹)
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Agent
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, idx) => (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-muted">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                          {booking.bookingNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {booking.date}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-foreground">
                            {booking.siteName}
                          </span>
                          <span className="text-muted"> / </span>
                          <span className="text-muted">
                            Plot: {booking.plotCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {booking.customerName}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {booking.mobile}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground font-medium">
                        {formatCurrency(booking.total)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                        {formatCurrency(booking.paid)}
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">
                        {formatCurrency(booking.balance)}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {booking.agentName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {booking.status === "Confirmed" && (
                            <button
                              onClick={() => handleDelete(booking)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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
                Showing {startIdx} – {endIdx} of {filteredBookings.length}{" "}
                bookings
              </p>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-muted font-medium">No bookings found</p>
            <p className="text-sm text-muted/60 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function parseBookingDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}
