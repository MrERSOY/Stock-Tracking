// components/charts/InventoryChart.tsx
"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface InventoryChartProps {
  fastMovingProducts: Array<{
    id: string;
    name: string;
    turnoverRate: number;
    revenue: number;
  }>;
  slowMovingProducts: Array<{
    id: string;
    name: string;
    daysInStock: number;
    stockValue: number;
  }>;
}

export function InventoryChart({
  fastMovingProducts,
  slowMovingProducts,
}: InventoryChartProps) {
  // Fast moving products chart
  const fastMovingData = {
    labels: fastMovingProducts
      .slice(0, 5)
      .map((product) =>
        product.name.length > 15
          ? product.name.substring(0, 15) + "..."
          : product.name
      ),
    datasets: [
      {
        label: "Devir Hızı",
        data: fastMovingProducts
          .slice(0, 5)
          .map((product) => product.turnoverRate),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 2,
      },
    ],
  };

  const fastMovingOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "En Hızlı Hareket Eden Ürünler",
        font: {
          size: 16,
          weight: "bold" as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: any) => {
            const index = context.dataIndex;
            const revenue = fastMovingProducts[index]?.revenue;
            if (revenue !== undefined) {
              return `Gelir: ${new Intl.NumberFormat("tr-TR", {
                style: "currency",
                currency: "TRY",
              }).format(revenue)}`;
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Ürünler",
        },
      },
      y: {
        title: {
          display: true,
          text: "Devir Hızı (x)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Fast Moving Products Chart */}
      <div className="w-full h-80">
        <Bar data={fastMovingData} options={fastMovingOptions} />
      </div>

      {/* Slow Moving Products Table */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">
          Yavaş Hareket Eden Ürünler
        </h3>
        <div className="space-y-2">
          {slowMovingProducts.slice(0, 5).map((product, index) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.daysInStock} gün stokta
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">
                  {new Intl.NumberFormat("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  }).format(product.stockValue)}
                </p>
                <p className="text-xs text-red-500">Yavaş</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
