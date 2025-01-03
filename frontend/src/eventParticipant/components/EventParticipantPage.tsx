import React, { useEffect, useState } from "react";
import axios from "axios";
import { AgendaItemDTO } from "../../types/eventTypes";

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
        `https://attendify-backend-el2r.onrender.com/api/auth/event-participant/join-event/${eventId}`,
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
        `https://attendify-backend-el2r.onrender.com/api/auth/event-participant/unjoin-event/${eventId}`,
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
        "https://attendify-backend-el2r.onrender.com/api/auth/event-participant/my-events",
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Events</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => fetchEvents("week")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          This Week ({thisWeekCount})
        </button>
        <button
          onClick={() => fetchEvents("month")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          This Month ({thisMonthCount})
        </button>
        <button
          onClick={() => fetchEvents("all")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          All Events ({allEventsCount})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const currentTime = new Date();
          const joinDeadline = new Date(event.joinDeadline);
          const isJoinDeadlinePassed = currentTime > joinDeadline;
          const isPending = event.status === "PENDING";
          const isAccepted = event.status === "ACCEPTED";
          const isNotJoined = event.status === "NOT_JOINED";

          return (
            <div
              key={event.id}
              className="p-4 border rounded shadow hover:shadow-lg"
            >
              <h3 className="text-xl font-bold mb-2">{event.name}</h3>
              <p className="text-gray-700 mb-2">{event.description}</p>
              <p className="text-gray-500">
                <strong>Location:</strong> {event.location}
              </p>
              <p className="text-gray-500">
                <strong>Company:</strong> {event.companyName}
              </p>
              <p className="text-gray-500">
                <strong>Date & Time:</strong> {event.eventDate}
              </p>
              <p className="text-gray-500">
                <strong>End Date & Time:</strong> {event.eventEndDate}
              </p>
              <p className="text-gray-500">
                <strong>Join Deadline:</strong> {event.joinDeadline}
              </p>
              <p className="text-gray-500">
                <strong>Status:</strong> {event.status}
              </p>
              <p className="text-gray-500">
                <strong>Available Seats:</strong>{" "}
                {event.joinedParticipants !== null &&
                event.attendeeLimit !== null
                  ? `${event.joinedParticipants}/${event.attendeeLimit}`
                  : "No limit"}
              </p>

              <h4 className="text-lg font-semibold mt-4">Agenda</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                {event.agendaItems.map((item: AgendaItemDTO) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong> - {item.description}
                    <br />
                    <span className="text-sm">
                      Start: {new Date(item.startTime).toLocaleString()}
                    </span>
                    <br />
                    <span className="text-sm">
                      End: {new Date(item.endTime).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              {isJoinDeadlinePassed && isNotJoined && (
                <p className="text-gray-500 italic">
                  The join deadline for this event has passed. You cannot join
                  this event.
                </p>
              )}

              {!isJoinDeadlinePassed && !isAccepted && !isPending && (
                <button
                  onClick={() => handleJoinEvent(event.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                >
                  Join Event
                </button>
              )}
              {(isPending || isAccepted) && (
                <button
                  onClick={() => handleUnjoinEvent(event.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full mt-2"
                >
                  Unjoin Event
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventParticipantPage;
