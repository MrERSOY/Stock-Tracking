// components/admin/charts/SampleLineChart.tsx
"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SampleLineChartProps {
  chartData: Array<{
    name: string;
    value: number;
    [key: string]: unknown;
  }>;
  titleText?: string;
}

const SampleLineChart: React.FC<SampleLineChartProps> = ({
  chartData,
  titleText,
}) => {
  return (
    <div className="w-full h-[400px]">
      {titleText && (
        <h3 className="text-lg font-semibold mb-4 text-center">{titleText}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: "#8884d8" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SampleLineChart;
