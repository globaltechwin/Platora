"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import {
  AgentForm,
  type AgentFormData,
} from "@/components/agents/agent-form";

export default function AddAgentPage() {
  const router = useRouter();

  const handleSubmit = async (data: AgentFormData) => {
    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create agent");
    }
    router.push("/agents");
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Add Agent</h1>
            <p className="text-sm text-muted mt-0.5">
              Register a new agent / broker
            </p>
          </div>
        </div>
        <Link
          href="/agents"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>
      </div>

      {/* Form */}
      <AgentForm
        mode="create"
        onSubmit={handleSubmit}
        onBack={() => router.push("/agents")}
      />
    </div>
  );
}
