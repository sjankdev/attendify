import React, { useEffect, useState } from "react";
import axios from "axios";

const EventParticipantPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [thisWeekCount, setThisWeekCount] = useState<number>(0);
  const [thisMonthCount, setThisMonthCount] = useState<number>(0);
  const [allEventsCount, setAllEventsCount] = useState<number>(0);

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

  const fetchEvents = async (filter?: string) => {
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
          params: {
            filter: filter,
          },
        }
      );

      if (response.data) {
        setEvents(response.data.events);
        setThisWeekCount(response.data.thisWeekCount);
        setThisMonthCount(response.data.thisMonthCount);
        setAllEventsCount(response.data.allEventsCount);
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

      <div>
        <button onClick={() => fetchEvents("week")}>
          This Week ({thisWeekCount})
        </button>
        <button onClick={() => fetchEvents("month")}>
          This Month ({thisMonthCount})
        </button>
        <button onClick={() => fetchEvents("all")}>
          All Events ({allEventsCount})
        </button>
      </div>

      <ul>
        {events.map((event) => {
          const currentTime = new Date();
          const joinDeadline = new Date(event.joinDeadline);
          const isJoinDeadlinePassed = currentTime > joinDeadline;
          const isPending = event.status === "PENDING";
          const isAccepted = event.status === "ACCEPTED";
          const isNotJoined = event.status === "NOT_JOINED";

          return (
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
                {event.joinedParticipants !== null &&
                event.attendeeLimit !== null
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

              {isJoinDeadlinePassed && isNotJoined && (
                <p style={{ color: "gray" }}>
                  The join deadline for this event has passed. You cannot join
                  this event.
                </p>
              )}

              {!isJoinDeadlinePassed && !isAccepted && !isPending && (
                <button onClick={() => handleJoinEvent(event.id)}>
                  Join Event
                </button>
              )}
              {(isPending || isAccepted) && (
                <button onClick={() => handleUnjoinEvent(event.id)}>
                  Unjoin Event
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default EventParticipantPage;
