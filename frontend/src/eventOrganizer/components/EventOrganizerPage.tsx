import React, { useEffect, useState } from "react";
import axios from "axios";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventActive, setEventActive] = useState<boolean>(true);

  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

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
          isEventActive: eventActive,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Event created successfully!");

      setEventName("");
      setEventDescription("");
      setEventDate("");
      fetchMyEvents();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to create event. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/events/my-events",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setEvents(response.data);
    } catch (err: any) {
      console.error("Error fetching events:", err);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventName || !eventDescription || !eventDate) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    console.log("Updating event with data:", {
      name: eventName,
      description: eventDescription,
      eventDate: eventDate,
      isEventActive: eventActive,
    });

    try {
      const response = await axios.put(
        `http://localhost:8080/events/update/${editingEvent.id}`,
        {
          name: eventName,
          description: eventDescription,
          eventDate: eventDate,
          isEventActive: eventActive,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log("Event updated response:", response.data);

      setMessage("Event updated successfully!");
      setEventName("");
      setEventDescription("");
      setEventDate("");
      setEventActive(true);
      setEditingEvent(null);
      fetchMyEvents();
    } catch (err: any) {
      console.error("Error updating event:", err);
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to update event. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setEventName(event.name);
    setEventDescription(event.description);
    setEventDate(event.eventDate);
    setEventActive(event.isEventActive);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEventName("");
    setEventDescription("");
    setEventDate("");
    setEventActive(true);
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  return (
    <div>
      {error && <div style={{ color: "red" }}>{error}</div>}

      {message && <div>{message}</div>}

      <h3>{editingEvent ? "Edit Event" : "Create an Event"}</h3>
      <form onSubmit={editingEvent ? handleUpdateEvent : handleCreateEvent}>
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

        <div>
          <label>Status</label>
          <select
            value={eventActive ? "active" : "inactive"}
            onChange={(e) => setEventActive(e.target.value === "active")}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading
            ? editingEvent
              ? "Updating Event..."
              : "Creating Event..."
            : editingEvent
            ? "Update Event"
            : "Create Event"}
        </button>

        {editingEvent && (
          <button type="button" onClick={handleCancelEdit}>
            Cancel
          </button>
        )}
      </form>

      <h3>Your Events</h3>
      {events.length > 0 ? (
        <ul>
          {events.map((event) => (
            <li
              key={event.id}
              style={{
                marginBottom: "20px",
                border: "1px solid #ddd",
                padding: "10px",
              }}
            >
              <strong>{event.name}</strong>
              <p>{event.description}</p>
              <p>
                <strong>Event Date:</strong>{" "}
                {new Date(event.eventDate).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {event.isEventActive ? "Active" : "Inactive"}
              </p>
              <button onClick={() => handleEditEvent(event)}>Edit</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No events found.</p>
      )}
    </div>
  );
};

export default EventOrganizerPage;
