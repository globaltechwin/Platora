"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { LogOut, Menu, Calendar, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Left - Menu toggle */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="text-muted hover:text-foreground p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right - Site name, Date, User */}
      <div className="flex items-center gap-5">
        {/* Site Name */}
        <span className="text-sm font-semibold text-primary hidden sm:block">
          Play Area Demo
        </span>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-sm text-foreground">
          <Calendar className="w-4 h-4 text-muted" />
          <span>{formattedDate}</span>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            <span>{user?.username || "demosite"} demotest2</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted">{user?.username}</p>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
