import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchEventDetailsWithParticipants,
  reviewJoinRequest,
  fetchEventFeedbacks,
  fetchEventFeedbackSummary,
} from "../services/eventOrganizerService";
import Layout from "../../shared/components/EventOrganizerLayout";
import { Event } from "../../types/eventTypes";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, any[]>>({});
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>(
    {}
  );
  const [showAccepted, setShowAccepted] = useState<{
    [eventId: number]: boolean;
  }>({});

  const [expandedFeedbacks, setExpandedFeedbacks] = useState<{
    [eventId: number]: boolean;
  }>({});

  const loadFeedbackSummary = async (eventId: number) => {
    try {
      const feedbackSummary = await fetchEventFeedbackSummary(eventId);
      console.log("Feedback Summary:", feedbackSummary);
      setFeedbacks((prevFeedbacks) => ({
        ...prevFeedbacks,
        [eventId]: feedbackSummary.feedbacks,
      }));
      setAverageRatings((prevRatings) => ({
        ...prevRatings,
        [eventId]: feedbackSummary.averageRating,
      }));
    } catch (error) {
      console.error(
        `Failed to load feedback summary for event ${eventId}:`,
        error
      );
    }
  };

  const loadEventDetails = async () => {
    try {
      if (!eventId) return;
      const data = await fetchEventDetailsWithParticipants(eventId);
      setEventDetails(data);

      await loadFeedbackSummary(parseInt(eventId));
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to fetch event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  const toggleFeedback = (eventId: number) => {
    setExpandedFeedbacks((prev) => {
      const isExpanded = prev[eventId];
      if (!isExpanded) {
        loadFeedbacks(eventId);
      }
      return {
        ...prev,
        [eventId]: !isExpanded,
      };
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <>
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400 inline-block" />
        ))}
        {halfStar && <FaStarHalfAlt className="text-yellow-400 inline-block" />}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar
            key={`empty-${i}`}
            className="text-yellow-400 inline-block"
          />
        ))}
      </>
    );
  };

  if (loading) {
    return (
      <div className="text-center text-lg text-gray-500">
        Loading event details...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  if (!eventDetails) {
    return (
      <div className="text-center text-lg text-red-600">
        Event details are unavailable.
      </div>
    );
  }

  const toggleAcceptedParticipants = (eventId: number) => {
    setShowAccepted((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const loadFeedbacks = async (eventId: number) => {
    try {
      const feedbackResponse = await fetchEventFeedbacks(eventId);
      setFeedbacks((prevFeedbacks) => ({
        ...prevFeedbacks,
        [eventId]: feedbackResponse,
      }));
    } catch (error) {
      console.error(`Failed to load feedback for event ${eventId}:`, error);
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
      setEventDetails((prevEventDetails) => {
        if (!prevEventDetails) {
          return prevEventDetails;
        }

        const updatedEvent = {
          ...prevEventDetails,
          participants: prevEventDetails.participants?.map((participant) => {
            if (participant.participantId === participantId) {
              return { ...participant, status };
            }
            return participant;
          }),
        };

        return updatedEvent;
      });
    } else {
      setError("Failed to update join request.");
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-[#313030] rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-white mb-4">
          {eventDetails.name}
        </h2>
        <p className="text-gray-300 mb-6">{eventDetails.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col space-y-2">
            <p className="text-lg text-white">
              <strong className="font-semibold">Location:</strong>{" "}
              {eventDetails.location}
            </p>
            <p className="text-lg text-white">
              <strong className="font-semibold">Date:</strong>{" "}
              {eventDetails.eventStartDate
                ? new Date(eventDetails.eventStartDate).toLocaleString()
                : "N/A"}
            </p>
            <p className="text-lg text-white">
              <strong className="font-semibold">End Date:</strong>{" "}
              {eventDetails.eventEndDate
                ? new Date(eventDetails.eventEndDate).toLocaleString()
                : "N/A"}
            </p>
            <p className="text-lg text-white">
              <strong className="font-semibold">Join Deadline:</strong>{" "}
              {eventDetails.joinDeadline
                ? new Date(eventDetails.joinDeadline).toLocaleString()
                : "N/A"}
            </p>
            <strong className="text-sm">Available Seats:</strong>
            <span>
              {eventDetails.attendeeLimit === null
                ? `Available: ${eventDetails.availableSeats ?? 0} / No Limit`
                : `Available: ${eventDetails.availableSeats ?? 0} / ${
                    eventDetails.attendeeLimit
                  }`}
            </span>
            <p className="flex items-center space-x-3">
              <strong className="text-sm">
                Available for All Departments:
              </strong>
              <span>
                {eventDetails.availableForAllDepartments ? "Yes" : "No"}
              </span>
            </p>
            <p className="flex items-center space-x-3">
              <strong className="text-sm">Pending Requests:</strong>
              <span>{eventDetails.pendingRequests}</span>
            </p>
          </div>

          {eventDetails.agendaItems.length > 0 && (
            <div className="mt-6 border-t border-gray-600 pt-4">
              <h4 className="text-lg font-semibold text-white flex items-center">
                Agenda:
              </h4>
              <ul className="space-y-4 mt-4">
                {eventDetails.agendaItems.map((agendaItem, index) => (
                  <li key={index} className="border-b border-gray-600 pb-4">
                    <h5 className="font-medium text-teal-400">
                      {agendaItem.title}
                    </h5>
                    <p className="text-gray-300 mt-1">
                      {agendaItem.description}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      {new Date(agendaItem.startTime).toLocaleString()} -{" "}
                      {new Date(agendaItem.endTime).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 border-t border-gray-600 pt-4">
            <h4 className="text-lg font-semibold text-white">Feedbacks:</h4>

            {feedbacks[eventDetails.id]?.length > 0 ? (
              <>
                <p className="text-gray-300 mt-2">
                  <strong className="font-medium">Average Rating:</strong>{" "}
                  {renderStars(averageRatings[eventDetails.id] || 0)}
                </p>

                <button
                  onClick={() => toggleFeedback(eventDetails.id)}
                  className="mt-2 text-teal-600 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {expandedFeedbacks[eventDetails.id]
                    ? "Hide Feedbacks"
                    : "View Feedbacks"}
                </button>

                {expandedFeedbacks[eventDetails.id] && (
                  <ul className="space-y-4 mt-4 bg-gray-800 rounded-lg p-4">
                    {feedbacks[eventDetails.id].map((feedback, index) => (
                      <li
                        key={index}
                        className="border-b border-gray-600 pb-4 last:border-none"
                      >
                        <p className="text-gray-300">{feedback.comments}</p>

                        <div className="mt-2 text-sm text-gray-400">
                          <p>
                            <strong className="font-medium">Rating:</strong>{" "}
                            {renderStars(feedback.rating)}
                          </p>
                          <p>
                            <strong className="font-medium">
                              Participant:
                            </strong>{" "}
                            {feedback.participantName}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-gray-300 mt-4">No feedbacks</p>
            )}
          </div>
          {eventDetails.participants?.length > 0 && (
            <div className="mt-6 border-t border-gray-600 pt-4">
              <h4 className="text-lg font-semibold text-white">
                Participants:
              </h4>

              <div className="mt-4">
                <h5 className="text-white">
                  Joined participants:{" "}
                  {
                    eventDetails.participants.filter(
                      (p) => p.status === "ACCEPTED"
                    ).length
                  }
                </h5>
                <button
                  className="mt-2 text-teal-600 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  onClick={() => toggleAcceptedParticipants(eventDetails.id)}
                >
                  {showAccepted[eventDetails.id] ? "Hide" : "View"} accepted
                  participants
                </button>
              </div>

              {showAccepted[eventDetails.id] &&
                eventDetails.participants.filter((p) => p.status === "ACCEPTED")
                  .length > 0 && (
                  <ul className="space-y-4 mt-4">
                    {eventDetails.participants
                      .filter((p) => p.status === "ACCEPTED")
                      .map((participant) => (
                        <li
                          key={participant.participantId}
                          className="flex justify-between items-center bg-[#252525] p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div>
                            <p className="text-white">
                              {participant.participantName}
                            </p>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}

              {eventDetails.participants.filter((p) => p.status === "PENDING")
                .length > 0 && (
                <div className="mt-6">
                  <h5 className="text-white">Pending participants</h5>
                  <ul className="space-y-4 mt-4">
                    {eventDetails.participants
                      .filter((p) => p.status === "PENDING")
                      .map((participant) => (
                        <li
                          key={participant.participantId}
                          className="flex justify-between items-center bg-[#252525] p-3 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        >
                          <div>
                            <p className="text-white">
                              {participant.participantName}
                            </p>
                          </div>
                          <div>
                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500 text-black">
                              {participant.status}
                            </span>
                          </div>
                          <div className="space-x-2">
                            <button
                              disabled={loading}
                              onClick={() =>
                                handleReviewJoinRequest(
                                  eventDetails.id,
                                  participant.participantId,
                                  "ACCEPTED"
                                )
                              }
                              className="bg-teal-600 text-white py-1 px-3 rounded-md hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                              Approve
                            </button>
                            <button
                              disabled={loading}
                              onClick={() =>
                                handleReviewJoinRequest(
                                  eventDetails.id,
                                  participant.participantId,
                                  "REJECTED"
                                )
                              }
                              className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Reject
                            </button>
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailsPage;
