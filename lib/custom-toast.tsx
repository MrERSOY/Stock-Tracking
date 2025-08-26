"use client";

import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Zap } from "lucide-react";

export const customToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      className: "border-green-200 bg-green-50 text-green-900",
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      className: "border-red-200 bg-red-50 text-red-900",
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      className: "border-yellow-200 bg-yellow-50 text-yellow-900",
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      className: "border-blue-200 bg-blue-50 text-blue-900",
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      className: "border-gray-200 bg-gray-50",
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
};
