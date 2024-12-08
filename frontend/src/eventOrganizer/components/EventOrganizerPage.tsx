import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [updatedEvent, setUpdatedEvent] = useState({
    name: "",
    description: "",
    location: "",
    eventDate: "",
    joinDeadline: "",
    attendeeLimit: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/auth/event-organizer/my-events",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          const eventsWithParticipants = await Promise.all(
            data.map(async (event: any) => {
              const participantsResponse = await fetch(
                `http://localhost:8080/api/auth/event-organizer/my-events/${event.id}/participants`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              if (participantsResponse.ok) {
                const participants = await participantsResponse.json();
                return { ...event, participants };
              } else {
                return event;
              }
            })
          );
          setEvents(
            eventsWithParticipants.map((event) => ({
              ...event,
              eventDate: new Date(event.eventDate).toLocaleString("en-GB", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              joinDeadline: event.joinDeadline
                ? new Date(event.joinDeadline).toLocaleString("en-GB", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "No Deadline",
            }))
          );
        } else {
          console.error("Failed to fetch events");
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/auth/event-organizer/delete-event/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );
        console.log(`Event with ID ${eventId} deleted successfully`);
      } else {
        setError("Failed to delete event");
        console.error("Failed to delete event");
      }
    } catch (error) {
      setError("Error deleting event");
      console.error("Error deleting event:", error);
    }
  };

  const handleUpdateEvent = async (eventId: number) => {
    if (updatedEvent.joinDeadline && updatedEvent.eventDate) {
      if (
        new Date(updatedEvent.joinDeadline) >= new Date(updatedEvent.eventDate)
      ) {
        setError("Join deadline must be before the event date.");
        return;
      }
    }

    try {
      const formattedEventDate = updatedEvent.eventDate
        ? new Date(updatedEvent.eventDate).toISOString()
        : null;
      const formattedJoinDeadline = updatedEvent.joinDeadline
        ? new Date(updatedEvent.joinDeadline).toISOString()
        : null;

      const response = await fetch(
        `http://localhost:8080/api/auth/event-organizer/update-event/${eventId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...updatedEvent,
            eventDate: formattedEventDate,
            joinDeadline: formattedJoinDeadline,
          }),
        }
      );

      if (!response.ok) {
        setError("Failed to update event");
        const text = await response.text();
        console.error("Response body:", text);
        return;
      }

      const responseText = await response.text();
      if (responseText) {
        const updatedEventData = JSON.parse(responseText);
        console.log("Updated event data:", updatedEventData);
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, ...updatedEventData } : event
          )
        );
        setIsEditing(false);
        setUpdatedEvent({
          name: "",
          description: "",
          location: "",
          eventDate: "",
          joinDeadline: "",
          attendeeLimit: "",
        });
        setCurrentEvent(null);
        setError(null);
        console.log(`Event with ID ${eventId} updated successfully`);
      } else {
        setError("No response body returned from the server.");
        console.error("No response body returned from the server.");
      }
    } catch (error) {
      setError("Error updating event");
      console.error("Error updating event:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedEvent((prevEvent) => ({
      ...prevEvent,
      [name]: name === "attendeeLimit" ? parseInt(value, 10) : value,
    }));
  };

  const handleEditEvent = (event: any) => {
    setIsEditing(true);
    setCurrentEvent(event);

    setUpdatedEvent({
      name: event.name,
      description: event.description,
      location: event.location,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString() : "",
      joinDeadline: event.joinDeadline
        ? new Date(event.joinDeadline).toISOString()
        : "",
      attendeeLimit: event.attendeeLimit || "",
    });
  };

  const handleGoToInvitations = () => {
    navigate("/event-organizer/invitations");
  };

  const handleGoToCreateEvent = () => {
    navigate("/event-organizer/create-event");
  };

  return (
    <div>
      <p>Hello event organizer</p>
      <button
        onClick={handleGoToInvitations}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Manage Invitations
      </button>
      <button
        onClick={handleGoToCreateEvent}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "10px",
        }}
      >
        Create Event
      </button>
      <div>
        <h2>My Events</h2>
        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <ul>
            {events.map((event) => (
              <li key={event.id}>
                <strong>{event.name}</strong> - {event.description}
                <br />
                <span>Location: {event.location}</span>
                <br />
                <span>Date: {event.eventDate}</span>
                <br />
                <span>Join Deadline: {event.joinDeadline}</span>{" "}
                {/* Display joinDeadline */}
                <br />
                <span>
                  Available Seats:{" "}
                  {event.availableSeats != null
                    ? event.availableSeats
                    : "No limit"}
                </span>
                <br />
                <div>
                  <h4>Participants:</h4>
                  {event.participants && event.participants.length > 0 ? (
                    <ul>
                      {event.participants.map((participant: any) => (
                        <li key={participant.participantEmail}>
                          {participant.participantName} -{" "}
                          {participant.participantEmail}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No participants joined yet.</p>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  style={{
                    marginLeft: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEditEvent(event)}
                  style={{
                    marginLeft: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#ffc107",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isEditing && currentEvent && (
        <div>
          <h3>Edit Event</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateEvent(currentEvent.id);
            }}
          >
            <div>
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={updatedEvent.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={updatedEvent.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Location:</label>
              <input
                type="text"
                name="location"
                value={updatedEvent.location}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Event Date:</label>
              <input
                type="datetime-local"
                name="eventDate"
                value={updatedEvent.eventDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Join Deadline:</label> {/* Added joinDeadline input */}
              <input
                type="datetime-local"
                name="joinDeadline"
                value={updatedEvent.joinDeadline}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Attendee Limit:</label>
              <input
                type="number"
                name="attendeeLimit"
                value={updatedEvent.attendeeLimit}
                onChange={handleInputChange}
              />
            </div>
            <button type="submit" style={{ backgroundColor: "#007bff" }}>
              Update Event
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{ marginLeft: "10px", backgroundColor: "#dc3545" }}
            >
              Cancel
            </button>
          </form>
          {error && <div style={{ color: "red" }}>{error}</div>}{" "}
          {/* Display error */}
        </div>
      )}
    </div>
  );
};

export default EventOrganizerPage;
