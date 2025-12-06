"use client";

import { useToast } from "@/hooks/use-toast";
import ToastItem from "@/components/ui/toast";

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed z-50 top-4 right-4 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
