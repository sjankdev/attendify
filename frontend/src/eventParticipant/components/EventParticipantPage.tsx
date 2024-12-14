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
      fetchEvents();
    } catch (err: any) {
      console.error("Error joining event:", err);
      setError(
        err.response?.data ||
          "Error joining event. Please check your connection."
      );
    }
  };

  const handleUnjoinEvent = async (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/auth/event-participant/unjoin-event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Event unjoined successfully:", response.data);
      setError(null);
      alert("Successfully unjoined the event!");
      fetchEvents();
    } catch (err: any) {
      console.error("Error unjoining event:", err);
      setError(
        err.response?.data ||
          "Error unjoining event. Please check your connection."
      );
    }
  };

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
        const formattedEvents = response.data.map((event: any) => {
          const eventDate = new Date(event.eventDate);
          event.eventDate = eventDate.toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          const eventEndDate = new Date(event.eventEndDate);
          event.eventEndDate = eventEndDate.toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          const joinDeadline = new Date(event.joinDeadline);
          event.joinDeadline = joinDeadline.toLocaleString("en-GB", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return event;
        });

        setEvents(formattedEvents);
        setError(null);
      } else {
        setError("No events found.");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to fetch events.");
    }
  };

  useEffect(() => {
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
            <p>Date & Time: {event.eventDate}</p>
            <p>End Date & Time: {event.eventEndDate}</p>
            <p>Join Deadline: {event.joinDeadline}</p>
            <p>Status: {event.status}</p>
            <p>
              Available Seats:{" "}
              {event.joinedParticipants !== null && event.attendeeLimit !== null
                ? `${event.joinedParticipants}/${event.attendeeLimit}`
                : "No limit"}
            </p>

            <h4>Agenda</h4>
            <ul>
              {event.agendaItems.map((item: any) => (
                <li key={item.title}>
                  <strong>{item.title}</strong> - {item.description}
                  <br />
                  <span>
                    Start: {new Date(item.startTime).toLocaleString()}
                  </span>
                  <br />
                  <span>End: {new Date(item.endTime).toLocaleString()}</span>
                </li>
              ))}
            </ul>

            <button onClick={() => handleJoinEvent(event.id)}>
              Join Event
            </button>
            <button
              onClick={() => handleUnjoinEvent(event.id)}
              style={{ marginLeft: "10px" }}
            >
              Unjoin Event
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventParticipantPage;
