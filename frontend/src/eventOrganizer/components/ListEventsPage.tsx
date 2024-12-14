import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchEventsWithParticipants,
  deleteEvent,
  reviewJoinRequest,
} from "../services/eventOrganizerService";
import { Event, Participant } from "../../types/eventTypes";

const ListEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await fetchEventsWithParticipants();
        setEvents(events);
      } catch (error) {
        console.error("Failed to load events:", error);
        setError("Failed to load events.");
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
      setError("Failed to delete event.");
    }
  };

  const handleReviewJoinRequest = async (
    eventId: number,
    participantId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    setLoading(true);
    const success = await reviewJoinRequest(eventId, participantId, status);
    setLoading(false);

    if (success) {
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants: event.participants?.map((participant) =>
                  participant.participantId === participantId
                    ? { ...participant, status }
                    : participant
                ),
              }
            : event
        )
      );
    } else {
      setError("Failed to update join request.");
    }
  };

  return (
    <div>
      <h2>My Events</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
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
              <span>End Date: {event.eventEndDate}</span>
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
                    {event.participants.map((participant: Participant) => (
                      <li key={participant.participantId}>
                        {participant.participantName} -{" "}
                        {participant.participantEmail}
                        <br />
                        <span>Status: {participant.status}</span>
                        <br />
                        {participant.status === "PENDING" && (
                          <div>
                            <button
                              disabled={loading}
                              onClick={() =>
                                handleReviewJoinRequest(
                                  event.id,
                                  participant.participantId,
                                  "ACCEPTED"
                                )
                              }
                            >
                              Approve
                            </button>
                            <button
                              disabled={loading}
                              onClick={() =>
                                handleReviewJoinRequest(
                                  event.id,
                                  participant.participantId,
                                  "REJECTED"
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No participants joined yet.</p>
                )}
              </div>
              <button
                onClick={() =>
                  navigate(`/event-organizer/update-event/${event.id}`)
                }
              >
                Edit
              </button>
              <button onClick={() => handleDeleteEvent(event.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListEventsPage;
