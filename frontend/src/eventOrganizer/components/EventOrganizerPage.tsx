import React, { useEffect, useState } from "react";
import axiosInstance from "../../security/api/axiosConfig";

const EventOrganizerPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [eventName, setEventName] = useState<string>("");
  const [eventDescription, setEventDescription] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>("");
  const [eventActive, setEventActive] = useState<boolean>(true);

  const [events, setEvents] = useState<any[]>([]);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);

  const fetchMyEvents = async () => {
    try {
      const response = await axiosInstance.get("/events/my-events", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setEvents(response.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/event-organizer/home", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setMessage(response.data);
        fetchMyEvents();
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDescription || !eventDate) {
      setMessage("All fields are required.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axiosInstance.post(
        "/events/create",
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
      setMessage(
        err?.response?.data?.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName || !eventDescription || !eventDate) {
      setMessage("All fields are required.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await axiosInstance.put(
        `/events/update/${editingEvent.id}`,
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
      setMessage(
        err?.response?.data?.message ||
          "Failed to update event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await axiosInstance.delete(`/events/delete/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setMessage("Event deleted successfully!");
      fetchMyEvents();
    } catch (err: any) {
      setMessage(
        err?.response?.data?.message ||
          "Failed to delete event. Please try again."
      );
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
              <button onClick={() => handleDeleteEvent(event.id)}>
                Delete
              </button>
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
