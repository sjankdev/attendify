import React, { useEffect, useState } from "react";
import axiosInstance from "../../security/api/axiosConfig";

const EventParticipantPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/event-participant/home", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMessage(response.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <div>{message ? message : "No data available"}</div>;
};

export default EventParticipantPage;
