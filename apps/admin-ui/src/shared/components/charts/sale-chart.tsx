"use client";

import React from "react";
import Chart, { Props } from "react-apexcharts";
import { Box } from "../box";

export const SalesChart = ({
  revenueData,
}: {
  revenueData?: {
    month: string;
    amount: number;
  }[];
}) => {
  const chartSeries: Props["series"] = [
    {
      name: "Revenue",
      data: revenueData?.map((data) => data.amount) || [
        4200, 5800, 3900, 7100, 5200, 8900, 8200,
      ],
    },
  ];

  const chartOptions: Props["options"] = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
      zoom: { enabled: false },
    },
    colors: ["#3b82f6"],
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        type: "vertical",
        opacityFrom: 0.55,
        opacityTo: 0.05,
        stops: [0, 100],
      },
    },
    grid: {
      show: false,
    },
    xaxis: {
      categories: revenueData?.map((data) => data.month) || [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
      ],
      labels: {
        style: { colors: "#94a3b8" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: false,
    },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <Box>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={280}
      />
    </Box>
  );
};
