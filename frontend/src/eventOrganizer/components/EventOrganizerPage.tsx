import React, { useEffect, useState } from "react";
import axios from "axios";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/event-organizer/home",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setMessage(response.data);
      } catch (err: any) {
        setError("You are not authorized or something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div>
      {message && <div>{message}</div>}
      <p>Hello event organizer</p>
    </div>
  );
};

export default EventOrganizerPage;