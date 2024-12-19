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
  const [filter, setFilter] = useState<string>("");
  const [counts, setCounts] = useState<{
    thisWeek: number;
    thisMonth: number;
    allEvents: number;
  }>({
    thisWeek: 0,
    thisMonth: 0,
    allEvents: 0,
  });
  const [acceptedParticipants, setAcceptedParticipants] = useState<{
    thisWeek: number;
    thisMonth: number;
    allEvents: number;
  }>({
    thisWeek: 0,
    thisMonth: 0,
    allEvents: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { events, counts, acceptedParticipants } =
          await fetchEventsWithParticipants(filter);
        setEvents(events);
        setCounts(counts);
        setAcceptedParticipants(acceptedParticipants);
      } catch (error) {
        console.error("Failed to load events:", error);
        setError("Failed to load events.");
      }
    };
    loadEvents();
  }, [filter]);

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
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-3xl text-center text-gray-800 mb-6">My Events</h2>
      {error && <div className="text-red-600 text-center mb-4">{error}</div>}

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setFilter("week")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          This Week ({counts.thisWeek} Events, {acceptedParticipants.thisWeek} Accepted)
        </button>
        <button
          onClick={() => setFilter("month")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          This Month ({counts.thisMonth} Events, {acceptedParticipants.thisMonth} Accepted)
        </button>
        <button
          onClick={() => setFilter("")}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          All Events ({counts.allEvents} Events, {acceptedParticipants.allEvents} Accepted)
        </button>
      </div>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul className="space-y-8">
          {events.map((event) => (
            <li key={event.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold text-gray-800">{event.name}</h3>
              <p className="text-gray-700 mb-4">{event.description}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Date:</strong> {event.eventDate}</p>
              <p><strong>End Date:</strong> {event.eventEndDate}</p>
              <p><strong>Join Deadline:</strong> {event.joinDeadline}</p>
              <p><strong>Available Seats:</strong> {event.acceptedParticipants}/{event.attendeeLimit}</p>
              <p><strong>Pending Requests:</strong> {event.pendingRequests}</p>
              <p><strong>Join Approval:</strong> {event.joinApproval ? "Enabled" : "Disabled"}</p>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-800">Agenda:</h4>
                {event.agendaItems.length > 0 ? (
                  <ul className="space-y-4">
                    {event.agendaItems.map((agendaItem, index) => (
                      <li key={index} className="bg-gray-100 p-4 rounded-md">
                        <strong>{agendaItem.title}</strong>
                        <p>{agendaItem.description}</p>
                        <span>
                          {new Date(agendaItem.startTime).toLocaleString()} -{" "}
                          {new Date(agendaItem.endTime).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No agenda items available.</p>
                )}
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-800">Participants:</h4>
                {event.participants && event.participants.length > 0 ? (
                  <ul className="space-y-4">
                    {event.participants.map((participant: Participant) => (
                      <li key={participant.participantId} className="bg-gray-100 p-4 rounded-md">
                        {participant.participantName} - {participant.participantEmail}
                        <br />
                        <span>Status: {participant.status}</span>
                        <br />
                        {participant.status === "PENDING" && (
                          <div className="flex gap-4 mt-2">
                            <button
                              disabled={loading}
                              onClick={() =>
                                handleReviewJoinRequest(
                                  event.id,
                                  participant.participantId,
                                  "ACCEPTED"
                                )
                              }
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
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
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => navigate(`/event-organizer/update-event/${event.id}`)}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListEventsPage;
