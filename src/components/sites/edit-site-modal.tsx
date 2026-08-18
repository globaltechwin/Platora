"use client";

import { useEffect, useState } from "react";
import { MapPin, X, CheckCircle } from "lucide-react";
import { SiteForm, type SiteFormData } from "./site-form";
import type { Site } from "@/lib/types/site";

interface EditSiteModalProps {
  isOpen: boolean;
  site: Site | null;
  onClose: () => void;
  onSiteUpdated?: (data: SiteFormData) => void | Promise<void>;
}

export function EditSiteModal({
  isOpen,
  site,
  onClose,
  onSiteUpdated,
}: EditSiteModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    setShowSuccess(false);
    setFormError(null);
    onClose();
  };

  const handleSubmit = async (data: SiteFormData) => {
    try {
      setFormError(null);
      await onSiteUpdated?.(data);
      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update site");
    }
  };

  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="px-12 py-16 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Site Updated!</h2>
            <p className="text-sm text-muted">
              The site has been updated successfully.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10 rounded-t-2xl">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Edit Site
              </h1>
              <button
                onClick={handleClose}
                className="p-1.5 text-muted hover:text-foreground hover:bg-input-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {formError && (
              <div className="mx-6 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {formError}
              </div>
            )}
            <SiteForm
              mode="edit"
              initialValues={site}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </div>
    </div>
  );
}
