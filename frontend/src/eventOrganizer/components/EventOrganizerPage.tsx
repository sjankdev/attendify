import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);

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
          console.log("Fetched events:", data);
          setEvents(data);
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
        console.error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
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
                {event.name} - {event.description}
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventOrganizerPage;
