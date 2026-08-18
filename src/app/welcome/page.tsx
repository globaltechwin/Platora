"use client";

import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Building2,
  Map,
  CalendarPlus,
  ClipboardList,
} from "lucide-react";

const quickLinks = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Agents", icon: Users, href: "/agents" },
  { label: "Sites", icon: Building2, href: "/sites" },
  { label: "Plots", icon: Map, href: "/plots" },
  { label: "New Booking", icon: CalendarPlus, href: "/bookings/new" },
  { label: "Booking List", icon: ClipboardList, href: "/bookings" },
];

export default function WelcomePage() {
  const { user } = useAuth();

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {/* Welcome Header */}
        <div className="px-6 py-5">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome <span className="font-normal text-muted">{user?.username || "demosite"},</span>
          </h1>
        </div>

        {/* Site Name */}
        <div className="px-6 pb-5">
          <h2 className="text-xl font-bold text-foreground text-center">
            Play Area Demo
          </h2>
        </div>

        {/* Divider */}
        <div className="border-t border-border mx-6" />

        {/* Info Section */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground w-[180px]">Branch:</span>
            <span className="text-primary font-medium">Play Area Demo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground w-[180px]">System Date:</span>
            <span className="text-foreground">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-foreground w-[180px]">License Date:</span>
            <span className="text-foreground font-bold">01/01/2030</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mx-6" />

        {/* Frequently Used Section */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-foreground">Frequently Used</h3>
            <span className="text-xs text-muted">Usage is tracked in your browser</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex flex-col items-center gap-3 p-5 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors group"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground text-center">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
