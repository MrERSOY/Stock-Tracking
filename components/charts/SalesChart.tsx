// components/charts/SalesChart.tsx
"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SalesChartProps {
  data: Array<{
    month: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  type?: "line" | "bar";
}

export function SalesChart({ data, type = "line" }: SalesChartProps) {
  const chartData = {
    labels: data.map((item) => {
      // Convert YYYY-MM format to readable month names
      if (item.month.includes("-")) {
        const [year, month] = item.month.split("-");
        const monthNames = [
          "Ocak",
          "Şubat",
          "Mart",
          "Nisan",
          "Mayıs",
          "Haziran",
          "Temmuz",
          "Ağustos",
          "Eylül",
          "Ekim",
          "Kasım",
          "Aralık",
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      }
      return item.month;
    }),
    datasets: [
      {
        label: "Gelir (₺)",
        data: data.map((item) => item.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        yAxisID: "y",
        tension: 0.3,
      },
      {
        label: "Sipariş Sayısı",
        data: data.map((item) => item.orders),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        yAxisID: "y1",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Aylık Satış Trendi",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const growth = data[index]?.growth;
            if (growth !== undefined) {
              return `Büyüme: ${growth > 0 ? "+" : ""}${growth.toFixed(1)}%`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Ay",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Gelir (₺)",
        },
        ticks: {
          callback: function (value: any) {
            return new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
              minimumFractionDigits: 0,
            }).format(value);
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Sipariş Sayısı",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const Component = type === "bar" ? Bar : Line;

  return (
    <div className="w-full h-80">
      <Component data={chartData} options={options} />
    </div>
  );
}
