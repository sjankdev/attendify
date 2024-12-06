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
      alert("Successfully joined the event!");
    } catch (err: any) {
      console.error("Error joining event:", err);
      if (err.response && err.response.data) {
        const errorMessage = err.response.data;

        if (errorMessage.includes("already joined this event")) {
          setError("You have already joined this event.");
        } else if (
          errorMessage.includes("cannot join an event outside your company")
        ) {
          setError("You cannot join an event outside your company.");
        } else if (
          errorMessage.includes("This event has reached its attendee limit")
        ) {
          setError("This event has reached its attendee limit.");
        } else {
          setError("Error joining event. Please try again later.");
        }
      } else {
        setError("Error joining event. Please check your connection.");
      }
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
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {events.map((event) => (
          <li key={event.id}>
            <h3>{event.name}</h3>
            <p>{event.description}</p>
            <p>Location: {event.location}</p>
            <p>Company: {event.companyName}</p>
            <p>
              Available Seats:{" "}
              {event.availableSeats != null ? event.availableSeats : "No limit"}
            </p>
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
