import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchEventStatistics } from "../services/eventOrganizerService";
import Layout from "../../shared/components/Layout";

interface EventStatistics {
  averageAge: number | null;
  highestAge: number | null;
  lowestAge: number | null;
  maleCount: number;
  femaleCount: number;
  otherCount: number;
}

const EventStatisticsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [stats, setStats] = useState<EventStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
        if (!eventId) {
          setError("Invalid event ID.");
          return;
        }
        try {
          const data = await fetchEventStatistics(eventId);
          setStats(data);
        } catch (error) {
          console.error("Failed to load event statistics:", error);
          setError("Failed to load statistics.");
        }
      };
      
    loadStatistics();
  }, [eventId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) {
    return <p>Loading...</p>;
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold">Event Statistics</h2>
        <div className="mt-6 space-y-4">
          <p><strong>Average Age:</strong> {stats.averageAge ?? "No Participants"}</p>
          <p><strong>Highest Age:</strong> {stats.highestAge ?? "No Participants"}</p>
          <p><strong>Lowest Age:</strong> {stats.lowestAge ?? "No Participants"}</p>
          <p><strong>Male Participants:</strong> {stats.maleCount}</p>
          <p><strong>Female Participants:</strong> {stats.femaleCount}</p>
          <p><strong>Other Participants:</strong> {stats.otherCount}</p>
        </div>
      </div>
    </Layout>
  );
};

export default EventStatisticsPage;
