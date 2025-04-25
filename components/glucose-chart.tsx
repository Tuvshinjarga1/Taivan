"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GlucoseReading {
  id: string;
  value: number;
  timestamp: Date;
  type: string;
}

interface GlucoseChartProps {
  readings: GlucoseReading[];
}

export default function GlucoseChart({ readings }: GlucoseChartProps) {
  // Sort readings by timestamp
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Format dates for display
  const labels = sortedReadings.map((reading) =>
    new Date(reading.timestamp).toLocaleDateString("mn-MN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );

  // Extract values
  const values = sortedReadings.map((reading) => reading.value);

  // Chart data
  const data = {
    labels,
    datasets: [
      {
        label: "Сахарын хэмжээ (мг/дл)",
        data: values,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.3,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    scales: {
      y: {
        min: 50,
        max: 200,
        ticks: {
          callback: function (value: any) {
            return value + " мг/дл";
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y} мг/дл`;
          },
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}
