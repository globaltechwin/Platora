"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  BarChart3,
  Building2,
  CreditCard,
  ClipboardList,
  CalendarPlus,
  Package,
  Wallet,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SubMenuItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Sites",
    icon: Building2,
    children: [
      { label: "Sites", href: "/sites", icon: Building2 },
      { label: "Payment Plans", href: "/sites/payment-plans", icon: CreditCard },
    ],
  },
  {
    label: "Plots",
    href: "/plots",
    icon: Map,
  },
  {
    label: "Bookings",
    icon: CalendarCheck,
    children: [
      { label: "New Booking", href: "/bookings/new", icon: CalendarPlus },
      { label: "Booking List", href: "/bookings/list", icon: ClipboardList },
    ],
  },
  {
    label: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    label: "Agent",
    href: "/agents",
    icon: Users,
  },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { label: "Inventory Report", href: "/reports/inventory", icon: Package },
      { label: "Collection Report", href: "/reports/collection", icon: Wallet },
      { label: "Outstanding Report", href: "/reports/outstanding", icon: AlertTriangle },
      { label: "Agent Performance Report", href: "/reports/agent-performance", icon: TrendingUp },
    ],
  },
];

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [flyoutPosition, setFlyoutPosition] = useState({ top: 0 });
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (item: MenuItem): boolean => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + "/");
    if (item.children) {
      return item.children.some(
        (child) => pathname === child.href || pathname.startsWith(child.href + "/")
      );
    }
    return false;
  };

  const isChildActive = (href: string): boolean => {
    return pathname === href;
  };

  const handleMouseEnter = useCallback((item: MenuItem, e: React.MouseEvent) => {
    if (!item.children) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyoutPosition({ top: rect.top });
    setHoveredItem(item.label);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
  }, []);

  const handleFlyoutMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleFlyoutMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 200);
  }, []);

  const hoveredMenuItem = menuItems.find((item) => item.label === hoveredItem);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[80px] bg-sidebar-bg text-sidebar-text flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-center border-b border-white/10">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);

              const linkContent = (
                <div className={`flex flex-col items-center gap-1 w-full py-2 rounded-lg transition-colors
                  ${active
                    ? "bg-white/10 text-white"
                    : "hover:bg-sidebar-hover text-sidebar-text hover:text-white"
                  }
                `}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[10px] leading-tight text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">
                    {item.label}
                  </span>
                </div>
              );

              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      title={item.label}
                    >
                      {linkContent}
                    </Link>
                  ) : (
                    <div
                      onMouseEnter={(e) => handleMouseEnter(item, e)}
                      onMouseLeave={handleMouseLeave}
                      className="cursor-default"
                    >
                      {linkContent}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Flyout Menu for items with children */}
      {hoveredMenuItem?.children && (
        <div
          className="fixed z-[60] w-56 bg-sidebar-bg border border-white/10 rounded-xl shadow-2xl py-2"
          style={{ top: flyoutPosition.top, left: 80 }}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          <div className="px-4 py-2 border-b border-white/10">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {hoveredMenuItem.label}
            </span>
          </div>
          <ul className="py-1">
            {hoveredMenuItem.children.map((child) => {
              const ChildIcon = child.icon;
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${isChildActive(child.href)
                        ? "bg-white/10 text-white"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-white"
                      }
                    `}
                  >
                    {ChildIcon && <ChildIcon className="w-4 h-4 opacity-60" />}
                    {child.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}
