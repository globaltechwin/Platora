import { CalendarCheck } from "lucide-react";

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarCheck className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
      </div>
      <div className="bg-white rounded-xl border border-border p-6">
        <p className="text-muted">Bookings content will be built here.</p>
      </div>
    </div>
  );
}
