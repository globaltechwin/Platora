"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  User,
  Lock,
  LogIn,
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  BarChart3,
  Building2,
  Globe,
} from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(username, password);
    if (!success) {
      setError("Invalid username or password");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#2c1210] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row gap-0">
        {/* Left Card - Login Form */}
        <div className="w-full lg:w-[420px] bg-white rounded-l-2xl rounded-r-none shadow-2xl px-8 py-10 flex flex-col items-center">
          <div className="w-full max-w-[340px]">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  Plotora
                </h1>
                <p className="text-xs text-muted">Plot Management System</p>
              </div>
            </div>

            {/* Welcome Text */}
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back
            </h2>
            <p className="text-muted mb-8">
              Sign in to your account to continue
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Username */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-bg border border-transparent rounded-xl text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-muted" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-input-bg border border-transparent rounded-xl text-foreground placeholder:text-muted/60 focus:border-primary focus:bg-white transition-colors"
                  required
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-5 h-5" />
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-xs text-muted mt-10">
              &copy; {new Date().getFullYear()} Plotora. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Card - Marketing */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#4a1a1a] via-[#5c2222] to-[#4a1a1a] rounded-r-2xl rounded-l-none shadow-2xl text-white flex-col items-center justify-center px-10 py-12 relative overflow-hidden">
          <div className="relative z-10 max-w-[520px] text-center">
            <h2 className="text-[2.5rem] font-bold mb-4 leading-tight">
              Everything You Need
              <br />
              in One Platform
            </h2>
            <p className="text-white/70 text-lg mb-10">
              Plot Management &middot; Booking &middot; Customer Relations
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left border border-white/10">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mb-3">
                  <Map className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Plot Tracking</h3>
                <p className="text-white/60 text-xs">Manage all your plots</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left border border-white/10">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-3">
                  <CalendarCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Smart Booking</h3>
                <p className="text-white/60 text-xs">Instant reservations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Customer Hub</h3>
                <p className="text-white/60 text-xs">Track all customers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left border border-white/10">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Reports</h3>
                <p className="text-white/60 text-xs">Detailed analytics</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard" },
                { icon: Map, label: "Plots" },
                { icon: CalendarCheck, label: "Bookings" },
                { icon: Users, label: "Customers" },
                { icon: Globe, label: "Sites" },
                { icon: BarChart3, label: "Reports" },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs text-white/80 border border-white/10"
                >
                  <tag.icon className="w-3.5 h-3.5" />
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
