import React, { useEffect, useState } from "react";
import axios from "axios";

const EventParticipantPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleJoinEvent = async (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/auth/event-participant/join-event/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Event joined successfully:", response.data);
      setError(null);
    } catch (err) {
      console.error("Error joining event:", err);
      setError("Error joining event.");
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found. Please log in.");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/auth/event-participant/my-events",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.length > 0) {
          setEvents(response.data);
        } else {
          setError("No events found.");
        }
      } catch (err) {
        setError("Failed to fetch events.");
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h1>Your Events</h1>
      {error && <p>{error}</p>}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h3>{event.name}</h3>
            <p>{event.description}</p>
            <p>Location: {event.location}</p>
            <p>Company: {event.companyName}</p>
            <button onClick={() => handleJoinEvent(event.id)}>
              Join Event
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventParticipantPage;
