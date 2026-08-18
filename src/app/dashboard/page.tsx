"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  CalendarDays,
  RefreshCw,
  IndianRupee,
  TrendingUp,
  MapPin,
  LandPlot,
  LayoutGrid,
  CircleDollarSign,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const DONUT_COLORS = ["#22c55e", "#f97316", "#3b82f6", "#a855f7"];

interface DashboardBooking {
  id: number;
  bookingNo: string;
  date: string;
  siteName: string;
  plotCode: string;
  customerName: string;
  mobile: string;
  total: number;
  paid: number;
  balance: number;
  status: string;
}

interface DashboardData {
  siteNames: string[];
  plotCounts: { total: number; available: number; blocked: number; booked: number; sold: number };
  bookings: DashboardBooking[];
  totalCollection: number;
  pendingCollection: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLastUpdated(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const siteNames = useMemo(() => {
    if (!data) return ["All Sites"];
    return ["All Sites", ...data.siteNames];
  }, [data]);

  const summaryData = useMemo(() => {
    if (!data) return { totalSites: 0, totalPlots: 0, available: 0, blocked: 0, booked: 0, sold: 0 };
    return {
      totalSites: data.siteNames.length,
      totalPlots: data.plotCounts.total,
      available: data.plotCounts.available,
      blocked: data.plotCounts.blocked,
      booked: data.plotCounts.booked,
      sold: data.plotCounts.sold,
    };
  }, [data]);

  const donutData = useMemo(
    () => [
      { name: "Available", value: summaryData.available, color: DONUT_COLORS[0] },
      { name: "Blocked", value: summaryData.blocked, color: DONUT_COLORS[1] },
      { name: "Booked", value: summaryData.booked, color: DONUT_COLORS[2] },
      { name: "Sold", value: summaryData.sold, color: DONUT_COLORS[3] },
    ],
    [summaryData],
  );

  const filteredBookings = useMemo(() => {
    if (!data) return [];
    return data.bookings.filter((b) => {
      const matchesSite = siteFilter === "All Sites" || b.siteName === siteFilter;
      let matchesDate = true;
      if (fromDate) {
        const [d, m, y] = b.date.split("/").map(Number);
        const bookingDate = new Date(y, m - 1, d);
        if (bookingDate < new Date(fromDate)) matchesDate = false;
      }
      if (toDate) {
        const [d, m, y] = b.date.split("/").map(Number);
        const bookingDate = new Date(y, m - 1, d);
        if (bookingDate > new Date(toDate)) matchesDate = false;
      }
      return matchesSite && matchesDate;
    });
  }, [data, siteFilter, fromDate, toDate]);

  const recentBookings = filteredBookings.slice(0, 4);

  const totalCollection = filteredBookings.reduce((sum, b) => sum + b.paid, 0);
  const pendingCollection = filteredBookings
    .filter((b) => b.status === "Confirmed")
    .reduce((sum, b) => sum + b.balance, 0);

  function handleRefresh() {
    setLoading(true);
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLastUpdated(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }),
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function formatCurrency(amount: number) {
    if (amount === 0) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Real Estate Dashboard</h1>
            <p className="text-sm text-muted">Overview of sites, plots, bookings and collections</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">Last updated: {lastUpdated}</span>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <Link
            href="/bookings/new"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            + New Booking
          </Link>
          <Link
            href="/plots"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <LayoutGrid className="h-4 w-4" />
            Plot Layout
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted" />
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {siteNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted" />
          <span className="text-sm text-muted">From</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">To</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700">
          <Filter className="h-4 w-4" />
          Apply Filter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4">
        <SummaryCard
          icon={<Building2 className="h-5 w-5" />}
          label="TOTAL SITES"
          value={summaryData.totalSites}
          sub="Active projects"
          color="bg-blue-100"
          iconColor="text-blue-600"
        />
        <SummaryCard
          icon={<LandPlot className="h-5 w-5" />}
          label="TOTAL PLOTS"
          value={summaryData.totalPlots}
          sub="All inventory"
          color="bg-blue-100"
          iconColor="text-blue-600"
        />
        <SummaryCard
          icon={<LayoutGrid className="h-5 w-5" />}
          label="AVAILABLE"
          value={summaryData.available}
          sub={`${summaryData.totalPlots > 0 ? Math.round((summaryData.available / summaryData.totalPlots) * 100) : 0}% of total`}
          color="bg-green-100"
          iconColor="text-green-600"
        />
        <SummaryCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="BLOCKED"
          value={summaryData.blocked}
          sub="On Hold"
          color="bg-orange-100"
          iconColor="text-orange-600"
        />
        <SummaryCard
          icon={<Clock className="h-5 w-5" />}
          label="BOOKED"
          value={summaryData.booked}
          sub={`${summaryData.totalPlots > 0 ? Math.round((summaryData.booked / summaryData.totalPlots) * 100) : 0}% of total`}
          color="bg-blue-100"
          iconColor="text-blue-600"
        />
        <SummaryCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          label="SOLD"
          value={summaryData.sold}
          sub={`${summaryData.totalPlots > 0 ? Math.round((summaryData.sold / summaryData.totalPlots) * 100) : 0}% of total`}
          color="bg-purple-100"
          iconColor="text-purple-600"
        />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Bookings This Period"
          value={String(filteredBookings.filter((b) => b.status === "Confirmed").length)}
          sub="bookings"
          subValue={`₹${formatCurrency(filteredBookings.filter((b) => b.status === "Confirmed").reduce((s, b) => s + b.total, 0))} sale value`}
          color="bg-blue-500"
        />
        <MetricCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Collection"
          value={formatCurrency(totalCollection)}
          sub=""
          subValue=""
          color="bg-green-500"
        />
        <MetricCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending Collection"
          value={formatCurrency(pendingCollection)}
          sub=""
          subValue=""
          color="bg-orange-500"
        />
        <MetricCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Overdue Collection"
          value="₹0"
          sub=""
          subValue=""
          color="bg-red-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Plot Status Distribution</h3>
          <div className="flex items-center gap-6">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} plots`, name]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <div className="mb-2 text-center">
                <span className="text-3xl font-bold text-foreground">{summaryData.totalPlots}</span>
                <br />
                <span className="text-xs text-muted">Total Plots</span>
              </div>
              <div className="mt-4 space-y-2">
                {donutData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-muted">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Booking &amp; Collection Trend</h3>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-xs text-muted">Bookings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-muted">Collection</span>
            </div>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <svg viewBox="0 0 500 200" className="h-full w-full">
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={`grid-${i}`}
                    x1="40"
                    y1={20 + i * 40}
                    x2="480"
                    y2={20 + i * 40}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}
                {[0, 1, 2, 3, 4].map((i) => (
                  <text
                    key={`y-${i}`}
                    x="35"
                    y={24 + i * 40}
                    textAnchor="end"
                    className="fill-muted"
                    fontSize="10"
                  >
                    {(4 - i) * 1}
                  </text>
                ))}
                <text x="110" y="195" textAnchor="middle" className="fill-muted" fontSize="11">Jun</text>
                <text x="290" y="195" textAnchor="middle" className="fill-muted" fontSize="11">Jul</text>
                <text x="470" y="195" textAnchor="middle" className="fill-muted" fontSize="11">Aug</text>
              </svg>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="rounded-lg border border-border bg-white shadow-sm">
        <div className="border-b border-border px-5 py-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Booking #</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Customer</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Site</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Plot</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted">Date</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted text-right">Amount</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted text-right">Paid</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted text-right">Balance</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted text-center">Status</th>
                <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted">
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-primary">{booking.bookingNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{booking.customerName}</div>
                      <div className="text-xs text-muted">{booking.mobile}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{booking.siteName}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-foreground">{booking.plotCode}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{booking.date}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-foreground">
                      ₹{booking.total.toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-foreground">
                      ₹{booking.paid.toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-red-600">
                      ₹{booking.balance.toLocaleString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center">
                      <button className="text-muted hover:text-foreground" title="View details">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  color,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-right text-2xl font-bold text-foreground">{value}</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  subValue,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  subValue: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <span className="text-white">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
        {subValue && <p className="text-xs text-muted">{subValue}</p>}
      </div>
    </div>
  );
}
