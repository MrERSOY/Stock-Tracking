// components/charts/CustomerChart.tsx
"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface CustomerChartProps {
  data: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
  };
  type?: "doughnut" | "pie";
}

export function CustomerChart({ data, type = "doughnut" }: CustomerChartProps) {
  const otherCustomers =
    data.totalCustomers - data.newCustomers - data.returningCustomers;

  const chartData = {
    labels: ["Yeni Müşteriler", "Geri Dönen Müşteriler", "Diğer Müşteriler"],
    datasets: [
      {
        label: "Müşteri Dağılımı",
        data: [
          data.newCustomers,
          data.returningCustomers,
          Math.max(0, otherCustomers),
        ],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)", // Blue for new customers
          "rgba(16, 185, 129, 0.8)", // Green for returning customers
          "rgba(156, 163, 175, 0.8)", // Gray for other customers
        ],
        borderColor: [
          "rgba(59, 130, 246, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(156, 163, 175, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Müşteri Segmentasyonu",
        font: {
          size: 16,
          weight: "bold" as const,
        },
        padding: {
          bottom: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : "0";
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
  };

  const Component = type === "pie" ? Pie : Doughnut;

  return (
    <div className="w-full h-80">
      <Component data={chartData} options={options} />
    </div>
  );
}
