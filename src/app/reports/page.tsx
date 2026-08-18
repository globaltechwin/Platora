import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
      </div>
      <div className="bg-white rounded-xl border border-border p-6">
        <p className="text-muted">Reports content will be built here.</p>
      </div>
    </div>
  );
}
