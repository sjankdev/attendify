import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { fetchEventStatistics } from "../services/eventOrganizerService";
import Layout from "../../shared/components/Layout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { EventStatistics } from "../../types/eventTypes";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
);

const formatNumber = (value: number | null | undefined) =>
  value ? value.toFixed(1) : "N/A";

const EventStatisticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [stats, setStats] = useState<EventStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadStatistics = async () => {
      if (!eventId) {
        setError("Invalid event ID.");
        setLoading(false);
        return;
      }
      try {
        const data = await fetchEventStatistics(eventId);
        setStats(data);
      } catch (error) {
        console.error("Failed to load event statistics:", error);
        setError("Oops! We couldn't fetch the stats. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, [eventId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center text-red-500 mt-10">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return null;
  }

  const totalParticipants =
    stats.maleCount + stats.femaleCount + stats.otherCount;

  const genderData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Participants",
        data: [stats.maleCount, stats.femaleCount, stats.otherCount],
        backgroundColor: ["#3b82f6", "#ec4899", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  const ageData = {
    labels: ["Average Age", "Highest Age", "Lowest Age"],
    datasets: [
      {
        label: "Age",
        data: [
          (stats.averageAge || 0).toFixed(1),
          (stats.highestAge || 0).toFixed(1),
          (stats.lowestAge || 0).toFixed(1),
        ],
        backgroundColor: ["#10b981", "#facc15", "#f87171"],
        borderWidth: 1,
      },
    ],
  };

  const experienceData = {
    labels: ["Average Experience", "Highest Experience", "Lowest Experience"],
    datasets: [
      {
        label: "Experience (Years)",
        data: [
          (stats.averageExperience || 0).toFixed(1),
          (stats.highestExperience || 0).toFixed(1),
          (stats.lowestExperience || 0).toFixed(1),
        ],
        backgroundColor: ["#06b6d4", "#8b5cf6", "#f87171"],
        borderWidth: 1,
      },
    ],
  };

  const departmentData = {
    labels: Object.keys(stats.departmentStats || {}),
    datasets: [
      {
        label: "Participants per Department",
        data: Object.values(stats.departmentStats || {}),
        backgroundColor: "#34d399",
        borderWidth: 1,
      },
    ],
  };

  const departmentChartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem: any) => {
            const department = tooltipItem.label || "";
            const participants = tooltipItem.raw || 0;
            return `${department}: ${participants}`;
          },
        },
      },
    },
  };

  const formatLabel = (label: string) => {
    return label
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const educationData = Object.values(stats.educationLevelStats).map(
    (eduStat) => eduStat.count
  );

  const rawToFormattedLabels: Record<string, string> = {};
  const educationLabels = Object.keys(stats.educationLevelStats).map(
    (rawLabel) => {
      const formattedLabel = formatLabel(rawLabel);
      rawToFormattedLabels[formattedLabel] = rawLabel;
      return formattedLabel;
    }
  );

  const educationChartData = {
    labels: educationLabels,
    datasets: [
      {
        label: "Education Level",
        data: educationData,
        backgroundColor: [
          "#6366f1",
          "#f59e0b",
          "#10b981",
          "#ef4444",
          "#8b5cf6",
        ],
        borderWidth: 1,
      },
    ],
  };

  const educationChartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const formattedLabel = tooltipItem.label || "";
            const rawLabel = rawToFormattedLabels[formattedLabel];

            const data = tooltipItem.raw || 0;
            const percentage =
              stats.educationLevelStats[rawLabel]?.percentage.toFixed(2) || "0";

            return `${formattedLabel}: ${data} (${percentage}%)`;
          },
        },
      },
    },
  };

  const occupationData = Object.values(stats.occupationStats).map(
    (occStat) => occStat.count
  );

  const occupationLabels = Object.keys(stats.occupationStats).map(
    (rawLabel) => {
      const formattedLabel = formatLabel(rawLabel);
      rawToFormattedLabels[formattedLabel] = rawLabel;
      return formattedLabel;
    }
  );

  const occupationChartData = {
    labels: occupationLabels,
    datasets: [
      {
        label: "Occupation",
        data: occupationData,
        backgroundColor: [
          "#3b82f6",
          "#ec4899",
          "#10b981",
          "#f59e0b",
          "#ef4444",
        ],
        borderWidth: 1,
      },
    ],
  };

  const occupationChartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem: any) {
            const formattedLabel = tooltipItem.label || "";
            const rawLabel = rawToFormattedLabels[formattedLabel];

            const data = tooltipItem.raw || 0;
            const percentage =
              stats.occupationStats[rawLabel]?.percentage.toFixed(2) || "0";

            return `${formattedLabel}: ${data} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-center mb-8">
          Event Statistics
        </h2>
        <div className="text-center mb-6">
          <p className="text-lg">
            Total Participants: <strong>{totalParticipants}</strong>
          </p>
          <p className="text-md">
            Average Age: {formatNumber(stats.averageAge)} | Highest:{" "}
            {formatNumber(stats.highestAge)} | Lowest:{" "}
            {formatNumber(stats.lowestAge)}
          </p>
          <p className="text-md">
            Average Experience: {formatNumber(stats.averageExperience)} |{" "}
            Highest: {formatNumber(stats.highestExperience)} | Lowest:{" "}
            {formatNumber(stats.lowestExperience)}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Gender Distribution
            </h3>
            <div className="w-3/4 mx-auto">
              <Pie data={genderData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Age Statistics
            </h3>
            <div className="w-3/4 mx-auto">
              <Bar data={ageData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Experience Statistics
            </h3>
            <div className="w-3/4 mx-auto">
              <Bar data={experienceData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Education Level Distribution
            </h3>
            <div className="w-3/4 mx-auto">
              <Pie data={educationChartData} options={educationChartOptions} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Occupation Distribution
            </h3>
            <div className="w-3/4 mx-auto">
              <Pie
                data={occupationChartData}
                options={occupationChartOptions}
              />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Participants per Department
            </h3>

            {Object.keys(stats.departmentStats || {}).length > 1 ? (
              <div className="w-3/4 mx-auto">
                <Bar data={departmentData} options={departmentChartOptions} />
              </div>
            ) : (
              <p className="text-center text-gray-500">
                Stats are not available since only one department is
                participating in this event.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventStatisticsPage;
