"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";
import {
  CustomerForm,
  type CustomerFormData,
} from "@/components/customers/customer-form";

export default function AddCustomerPage() {
  const router = useRouter();

  const handleSubmit = async (data: CustomerFormData) => {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create customer");
    }
    router.push("/customers");
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
            <h1 className="text-2xl font-bold text-foreground">
              Add Customer
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Register a new customer / lead
            </p>
          </div>
        </div>
        <Link
          href="/customers"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      {/* Form */}
      <CustomerForm
        mode="create"
        onSubmit={handleSubmit}
        onBack={() => router.push("/customers")}
      />
    </div>
  );
}
