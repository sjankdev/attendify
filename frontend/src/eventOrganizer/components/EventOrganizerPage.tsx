import React, { useEffect, useState } from "react";
import axios from "axios";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventActive, setEventActive] = useState<boolean>(true);

  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

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
        fetchMyEvents();
      } catch (err: any) {
        setError("You are not authorized or something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDescription || !eventDate) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.put(
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

      setMessage("Event updated successfully!");
      setEventName("");
      setEventDescription("");
      setEventDate("");
      setEventActive(true);
      setEditingEvent(null);
      fetchMyEvents();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to update event. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await axios.delete(`http://localhost:8080/events/delete/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("Event deleted successfully!");
      fetchMyEvents();
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        "Failed to delete event. Please try again.";
      setError(errorMessage);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div>
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

        <button type="submit">
          {editingEvent ? "Update Event" : "Create Event"}
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
            <li key={event.id}>
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
              <button onClick={() => handleDeleteEvent(event.id)}>Delete</button>
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