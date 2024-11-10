import React, { useEffect, useState } from "react";
import axios from "axios";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");

  const [events, setEvents] = useState<any[]>([]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName || !eventDescription || !eventDate) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:8080/events/create",
        {
          name: eventName,
          description: eventDescription,
          eventDate: eventDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Event created successfully!");
      fetchEvents();
    } catch (err: any) {
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/events/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvents(response.data);
      setMessage(null);
    } catch (err: any) {
      setError("Failed to fetch events. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      {message && <div>{message}</div>}

      {/* Event creation form */}
      <h3>Create an Event</h3>
      <form onSubmit={handleCreateEvent}>
        <div>
          <label>Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Event Description</label>
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Event Date</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Event..." : "Create Event"}
        </button>
      </form>

      <h3>Your Events</h3>
      {events.length === 0 ? (
        <div>No events created yet.</div>
      ) : (
        <ul>
          {events.map((event: any) => (
            <li key={event.id}>
              <h4>{event.name}</h4>
              <p>{event.description}</p>
              <p>{new Date(event.eventDate).toLocaleString()}</p>
              <p>{event.isActive ? "Active" : "Inactive"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventOrganizerPage;
