import React, { useEffect, useState } from "react";
import axios from "axios";

const EventParticipantPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      console.log("Authorization Token:", token);

      if (!token) {
        console.error("No token found");
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/auth/event-participant/my-events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Backend response:", response);

        if (response.data && response.data.length > 0) {
          setEvents(response.data);
        } else {
          setError("No events found for you.");
        }
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to fetch events.");
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Your Events</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {events.map((event, index) => (
            <li key={index}>
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              <p>Location: {event.location}</p>
              <p>Company: {event.company}</p>
              <p>Organizer: {event.organizerName || "No organizer"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventParticipantPage;
