import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchEventsWithParticipants,
  deleteEvent,
  reviewJoinRequest,
} from "../services/eventOrganizerService";
import { Event, Participant } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";

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
    <Layout>
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">My Events</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="mb-6 space-x-4">
          <button
            onClick={() => setFilter("week")}
            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
          >
            This Week ({counts.thisWeek} Events, {acceptedParticipants.thisWeek}{" "}
            Accepted)
          </button>
          <button
            onClick={() => setFilter("month")}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            This Month ({counts.thisMonth} Events,{" "}
            {acceptedParticipants.thisMonth} Accepted)
          </button>
          <button
            onClick={() => setFilter("")}
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            All Events ({counts.allEvents} Events,{" "}
            {acceptedParticipants.allEvents} Accepted)
          </button>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden p-6"
              >
                <h3 className="text-2xl font-semibold text-gray-800">
                  {event.name}
                </h3>
                <p className="text-gray-600 mt-2">{event.description}</p>

                <div className="mt-4 space-y-2">
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.eventDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(event.eventEndDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Join Deadline:</strong>{" "}
                    {event.joinDeadline
                      ? new Date(event.joinDeadline).toLocaleString()
                      : "N/A"}
                  </p>
                  <p>
                    <strong>Available Seats: </strong>
                    {event.attendeeLimit === null
                      ? `${event.acceptedParticipants}/no limit`
                      : `${event.acceptedParticipants}/${event.attendeeLimit}`}
                  </p>
                  <p>
                    <strong>Pending Requests:</strong> {event.pendingRequests}
                  </p>
                  <p>
                    <strong>Average Age:</strong>{" "}
                    {event.averageAge ? event.averageAge.toFixed(1) : "N/A"}
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() =>
                      navigate(`/event-organizer/update-event/${event.id}`)
                    }
                    className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 w-full"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 w-full mt-2"
                  >
                    Delete
                  </button>
                </div>

                {event.agendaItems.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Agenda:
                    </h4>
                    <ul className="space-y-4">
                      {event.agendaItems.map((agendaItem, index) => (
                        <li key={index} className="border-b pb-4">
                          <h5 className="font-medium text-gray-700">
                            {agendaItem.title}
                          </h5>
                          <p className="text-gray-600">
                            {agendaItem.description}
                          </p>
                          <p className="text-gray-500">
                            {new Date(agendaItem.startTime).toLocaleString()} -{" "}
                            {new Date(agendaItem.endTime).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.participants?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xl font-semibold text-gray-800">
                      Participants:
                    </h4>
                    <ul className="space-y-4">
                      {event.participants.map((participant: Participant) => (
                        <li
                          key={participant.participantId}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p>{participant.participantName}</p>
                            <p className="text-sm text-gray-600">
                              {participant.participantEmail}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm ${
                                participant.status === "PENDING"
                                  ? "bg-yellow-500 text-white"
                                  : participant.status === "ACCEPTED"
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {participant.status}
                            </span>
                          </div>
                          {participant.status === "PENDING" && (
                            <div className="space-x-2 mt-2">
                              <button
                                disabled={loading}
                                onClick={() =>
                                  handleReviewJoinRequest(
                                    event.id,
                                    participant.participantId,
                                    "ACCEPTED"
                                  )
                                }
                                className="bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700"
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
                                className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListEventsPage;
