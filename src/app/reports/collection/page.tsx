"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  ClipboardList,
  Search,
  X,
  Download,
  IndianRupee,
  FileText,
  BarChart3,
  ArrowUp,
} from "lucide-react";
import type { Payment } from "@/lib/types/payment";

export default function CollectionReportPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [agentFilter, setAgentFilter] = useState("All Agents");
  const [paymentModeFilter, setPaymentModeFilter] = useState("All Modes");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((d) => {
        setPayments(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const siteNames = useMemo(() => {
    const names = new Set(payments.map((p) => p.siteName));
    return Array.from(names).sort();
  }, [payments]);

  const agentNames = useMemo(() => {
    const names = new Set(payments.map((p) => p.postedBy).filter(Boolean));
    return Array.from(names).sort();
  }, [payments]);

  const filteredReceipts = useMemo(() => {
    return payments.filter((r) => {
      const matchesSite =
        siteFilter === "All Sites" || r.siteName === siteFilter;
      const matchesAgent =
        agentFilter === "All Agents" || r.postedBy === agentFilter;
      const matchesMode =
        paymentModeFilter === "All Modes" || r.mode === paymentModeFilter;

      let matchesDate = true;
      if (fromDate) {
        const paymentDate = parseDate(r.date);
        const from = new Date(fromDate);
        if (paymentDate < from) matchesDate = false;
      }
      if (toDate) {
        const paymentDate = parseDate(r.date);
        const to = new Date(toDate);
        if (paymentDate > to) matchesDate = false;
      }

      return matchesSite && matchesAgent && matchesMode && matchesDate;
    });
  }, [payments, siteFilter, agentFilter, paymentModeFilter, fromDate, toDate]);

  const stats = useMemo(() => {
    const totalCollected = filteredReceipts.reduce(
      (sum, r) => sum + r.amount,
      0,
    );
    const numOfReceipts = filteredReceipts.length;
    const averageReceipt =
      numOfReceipts > 0 ? totalCollected / numOfReceipts : 0;
    const largestReceipt =
      filteredReceipts.length > 0
        ? Math.max(...filteredReceipts.map((r) => r.amount))
        : 0;
    return { totalCollected, numOfReceipts, averageReceipt, largestReceipt };
  }, [filteredReceipts]);

  const handleClear = useCallback(() => {
    setSiteFilter("All Sites");
    setAgentFilter("All Agents");
    setPaymentModeFilter("All Modes");
    setFromDate("");
    setToDate("");
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
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Collection Report
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Payment receipts and collection summary
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
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Agent
            </label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Agents</option>
              {agentNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-44">
            <label className="block text-xs font-medium text-muted mb-1.5">
              Payment Mode
            </label>
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-input-bg border border-transparent rounded-lg text-sm text-foreground focus:border-primary focus:bg-white transition-colors appearance-none cursor-pointer"
            >
              <option>All Modes</option>
              <option>Cash</option>
              <option>UPI</option>
              <option>BankTransfer</option>
              <option>Cheque</option>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100">
            <IndianRupee className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">
              ₹ {formatCurrency(stats.totalCollected)}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Total Collected
            </p>
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
            <FileText className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">
              {stats.numOfReceipts}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              No. of Receipts
            </p>
          </div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
            <BarChart3 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-700">
              ₹ {formatCurrency(stats.averageReceipt)}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Average Receipt
            </p>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-100">
            <ArrowUp className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-700">
              ₹ {formatCurrency(stats.largestReceipt)}
            </p>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Largest Receipt
            </p>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Receipts</h2>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            {filteredReceipts.length}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-muted">Loading receipts...</p>
          </div>
        ) : filteredReceipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Receipt No.
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Booking No.
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Site / Plot
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Ref.
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Amount (₹)
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Posted By
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReceipts.map((receipt, idx) => (
                  <tr
                    key={receipt.id}
                    className="border-b border-border last:border-b-0 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted">{idx + 1}</td>
                    <td className="px-4 py-3 text-blue-600 font-medium cursor-pointer hover:text-blue-700">
                      {receipt.receiptNo}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {receipt.date}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {receipt.bookingNo}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {receipt.customerName}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {receipt.siteName} / {receipt.plotCode}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {receipt.mode}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {receipt.ref || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground font-medium">
                      {formatCurrency(receipt.amount)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {receipt.postedBy || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          receipt.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : receipt.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {receipt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <ClipboardList className="w-12 h-12 text-muted/30 mx-auto mb-3" />
            <p className="text-muted font-medium">No receipts found.</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <p className="text-sm text-muted">
            Showing {filteredReceipts.length} of {payments.length} receipts
          </p>
        </div>
      </div>
    </div>
  );
}

function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}
