import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteEvent, updateEvent, fetchEventsWithParticipants } from "../services/eventOrganizerService";
import { Event, Participant } from "../../types/eventTypes"; 

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [updatedEvent, setUpdatedEvent] = useState<Partial<Event>>({
    name: "",
    description: "",
    location: "",
    eventDate: "",
    joinDeadline: "",
    attendeeLimit: undefined,
    joinApproval: false,
  });
  
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await fetchEventsWithParticipants();
        setEvents(events);
      } catch (error) {
        console.error("Failed to load events:", error);
      }
    };
    loadEvents();
  }, []);

  const handleDeleteEvent = async (eventId: number) => {
    const success = await deleteEvent(eventId);
    if (success) {
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== eventId)
      );
    } else {
      setError("Failed to delete event");
    }
  };
  
  const handleUpdateEvent = async (eventId: number) => {
    if ((updatedEvent.attendeeLimit ?? 0) < (currentEvent.participants?.length ?? 0)) {
      setError(
        "Attendee limit cannot be lower than the current number of participants."
      );
      return;
    }
    
  
    if (updatedEvent.joinDeadline && updatedEvent.eventDate) {
      if (
        new Date(updatedEvent.joinDeadline) >= new Date(updatedEvent.eventDate)
      ) {
        setError("Join deadline must be before the event date.");
        return;
      }
    }
  
    const updatedEventData = await updateEvent(eventId, updatedEvent);
    if (updatedEventData) {
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
        attendeeLimit: undefined,
        joinApproval: false,
      });
      setCurrentEvent(null);
      setError(null);
    } else {
      setError("Failed to update event");
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
      joinApproval: event.joinApproval || false,
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
                <span>Join Deadline: {event.joinDeadline}</span>
                <br />
                <span>
                  Joined/Limit:{" "}
                  {event.participants != null && event.attendeeLimit != null
                    ? `${event.participants.length}/${event.attendeeLimit}`
                    : "No limit"}
                </span>
                <br />
                <span>
                  Join Approval: {event.joinApproval ? "Enabled" : "Disabled"}
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
              <label>Join Deadline:</label>
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
            <div>
              <label>
                <input
                  type="checkbox"
                  name="joinApproval"
                  checked={updatedEvent.joinApproval}
                  onChange={(e) =>
                    setUpdatedEvent({
                      ...updatedEvent,
                      joinApproval: e.target.checked,
                    })
                  }
                />
                Join Approval
              </label>
            </div>
            <button type="submit" style={{ padding: "10px 20px" }}>
              Update Event
            </button>
            {error && <div style={{ color: "red" }}>{error}</div>}
          </form>
        </div>
      )}
    </div>
  );
};

export default EventOrganizerPage;
