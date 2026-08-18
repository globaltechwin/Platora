"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AlertTriangle,
  Search,
  X,
  Download,
  IndianRupee,
  Clock,
  FileText,
  List,
} from "lucide-react";

interface OutstandingRow {
  id: number;
  bookingNo: string;
  customer: string;
  mobile: string;
  sitePlot: string;
  installment: string;
  dueDate: string;
  due: number;
  paid: number;
  balance: number;
  overdueDays: number;
  status: "Pending" | "Overdue" | "Paid";
}

export default function OutstandingReportPage() {
  const [items, setItems] = useState<OutstandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [overdueOnly, setOverdueOnly] = useState("All Pending");
  const [overdueDays, setOverdueDays] = useState("0");

  useEffect(() => {
    fetch("/api/reports/outstanding")
      .then((r) => r.json())
      .then((d) => {
        setItems(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const siteNames = useMemo(() => {
    const names = new Set(items.map((i) => i.sitePlot.split(" / ")[0]));
    return Array.from(names).sort();
  }, [items]);

  const filteredInstallments = useMemo(() => {
    return items.filter((item) => {
      const site = item.sitePlot.split(" / ")[0];
      const matchesSite = siteFilter === "All Sites" || site === siteFilter;
      const matchesOverdue =
        overdueOnly === "All Pending" ||
        (overdueOnly === "Overdue Only" && item.overdueDays > 0);
      const matchesDays =
        overdueDays === "" ||
        item.overdueDays >= parseInt(overdueDays, 10);
      return matchesSite && matchesOverdue && matchesDays;
    });
  }, [items, siteFilter, overdueOnly, overdueDays]);

  const stats = useMemo(() => {
    const totalOutstanding = filteredInstallments.reduce(
      (sum, i) => sum + i.balance,
      0,
    );
    const overdueAmount = filteredInstallments
      .filter((i) => i.overdueDays > 0)
      .reduce((sum, i) => sum + i.balance, 0);
    const bookingsWithPending = new Set(
      filteredInstallments
        .filter((i) => i.status !== "Paid")
        .map((i) => i.bookingNo),
    ).size;
    const pendingInstallments = filteredInstallments.filter(
      (i) => i.status !== "Paid",
    ).length;
    return {
      totalOutstanding,
      overdueAmount,
      bookingsWithPending,
      pendingInstallments,
    };
  }, [filteredInstallments]);

  const handleClear = useCallback(() => {
    setSiteFilter("All Sites");
    setOverdueOnly("All Pending");
    setOverdueDays("0");
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Outstanding Report
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Pending and overdue payment installments
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
          <div className="w-full md:w-52">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Overdue Only
            </label>
            <select
              value={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Pending</option>
              <option>Overdue Only</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Overdue Days (&gt;)
            </label>
            <input
              type="number"
              value={overdueDays}
              onChange={(e) => setOverdueDays(e.target.value)}
              min="0"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
            <IndianRupee className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              ₹ {formatCurrency(stats.totalOutstanding)}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Outstanding
            </p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">
              ₹ {formatCurrency(stats.overdueAmount)}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Overdue Amount
            </p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">
              {stats.bookingsWithPending}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Bookings with Pending
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
            <List className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {stats.pendingInstallments}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Pending Installments
            </p>
          </div>
        </div>
      </div>

      {/* Outstanding Installments Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">
            Outstanding Installments
          </h2>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {filteredInstallments.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted">Loading outstanding installments...</p>
          </div>
        ) : filteredInstallments.length > 0 ? (
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
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Site / Plot
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Installment
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Due (₹)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Paid (₹)
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Balance (₹)
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Overdue Days
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInstallments.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium cursor-pointer hover:text-blue-700">
                      {item.bookingNo}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {item.customer}
                    </td>
                    <td className="px-4 py-3 text-foreground">{item.mobile}</td>
                    <td className="px-4 py-3 text-foreground">
                      {item.sitePlot}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {item.installment}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {item.dueDate}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCurrency(item.due)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">
                      {formatCurrency(item.paid)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">
                      {formatCurrency(item.balance)}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">
                      {item.overdueDays}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : item.status === "Overdue"
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-muted font-medium">
              No outstanding installments.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-sm text-muted">
            Showing {filteredInstallments.length} of {items.length} installments
          </p>
        </div>
      </div>
    </div>
  );
}
