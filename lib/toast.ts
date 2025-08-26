"use client";

import React from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Zap } from "lucide-react";

export const customToast = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: React.createElement(CheckCircle, { className: "h-4 w-4" }),
      className: "border-green-200 bg-green-50 text-green-900",
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: React.createElement(XCircle, { className: "h-4 w-4" }),
      className: "border-red-200 bg-red-50 text-red-900",
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: React.createElement(AlertTriangle, { className: "h-4 w-4" }),
      className: "border-yellow-200 bg-yellow-50 text-yellow-900",
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: React.createElement(Info, { className: "h-4 w-4" }),
      className: "border-blue-200 bg-blue-50 text-blue-900",
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      className: "border-gray-200 bg-gray-50",
    });
  },

  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success: (data: T) => {
        return typeof success === "function" ? success(data) : success;
      },
      error: (err: any) => {
        return typeof error === "function" ? error(err) : error;
      },
    });
  },
};
