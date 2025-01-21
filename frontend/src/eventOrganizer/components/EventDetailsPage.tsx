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
import {
  FaCalendarAlt,
  FaStarHalfAlt,
  FaRegStar,
  FaMapMarkerAlt,
  FaUsers,
  FaClipboardList,
  FaStar,
} from "react-icons/fa";

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
      <div className="max-w-7xl mx-auto px-6 py-8 bg-[#101010] text-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-indigo-400">
          {eventDetails.name}
        </h2>
        <p className="mt-4 text-lg text-gray-300">{eventDetails.description}</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-indigo-300 flex items-center">
                <FaCalendarAlt className="mr-2" /> Event Dates
              </h3>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    Start Date:
                  </p>
                  <p className="text-lg text-gray-400">
                    {eventDetails.eventStartDate
                      ? new Date(eventDetails.eventStartDate).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    End Date:
                  </p>
                  <p className="text-lg text-gray-400">
                    {eventDetails.eventEndDate
                      ? new Date(eventDetails.eventEndDate).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    Join Deadline:
                  </p>
                  <p className="text-lg text-gray-400">
                    {eventDetails.joinDeadline
                      ? new Date(eventDetails.joinDeadline).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-indigo-300 flex items-center">
                <FaMapMarkerAlt className="mr-2" /> Location & Seats
              </h3>
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    Location:
                  </p>
                  <p className="text-lg text-gray-400">
                    {eventDetails.location}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    Available Seats:
                  </p>
                  <p
                    className={`text-lg font-medium ${
                      eventDetails.attendeeLimit === null
                        ? "text-green-500"
                        : eventDetails.availableSeats === 0
                        ? "text-red-500"
                        : eventDetails.availableSeats <=
                          (eventDetails.attendeeLimit ?? Infinity) * 0.2
                        ? "text-yellow-400"
                        : eventDetails.availableSeats <=
                          (eventDetails.attendeeLimit ?? Infinity) * 0.5
                        ? "text-yellow-400"
                        : eventDetails.availableSeats <=
                          (eventDetails.attendeeLimit ?? Infinity) * 0.8
                        ? "text-blue-400"
                        : "text-green-400"
                    }`}
                  >
                    {eventDetails.attendeeLimit === null
                      ? `Available: ${
                          eventDetails.availableSeats ?? 0
                        } / No Limit`
                      : `Available: ${eventDetails.availableSeats ?? 0} / ${
                          eventDetails.attendeeLimit
                        }`}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    For All Departments:
                  </p>
                  <p className="text-lg text-gray-400">
                    {eventDetails.availableForAllDepartments ? "Yes" : "No"}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-semibold text-gray-200">
                    Pending Requests:
                  </p>
                  <p className="text-lg text-gray-400">
                    {eventDetails.pendingRequests}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-indigo-300 flex items-center">
                <FaUsers className="mr-2" /> Participants
              </h3>
              {eventDetails.participants?.length > 0 && (
                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-semibold text-lg">
                      Joined participants:{" "}
                      {
                        eventDetails.participants.filter(
                          (p) => p.status === "ACCEPTED"
                        ).length
                      }
                    </h5>
                    <button
                      onClick={() =>
                        toggleAcceptedParticipants(eventDetails.id)
                      }
                      className={`mt-2 px-4 py-2 rounded-lg shadow-md transition ease-in-out duration-200 ${
                        showAccepted[eventDetails.id]
                          ? "bg-indigo-500 text-white hover:bg-indigo-600"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {showAccepted[eventDetails.id] ? "Hide" : "View"} accepted
                      participants
                    </button>
                  </div>

                  {showAccepted[eventDetails.id] &&
                    eventDetails.participants.filter(
                      (p) => p.status === "ACCEPTED"
                    ).length > 0 && (
                      <div className="space-y-4 mt-4">
                        {eventDetails.participants
                          .filter((p) => p.status === "ACCEPTED")
                          .map((participant) => (
                            <div
                              key={participant.participantId}
                              className="bg-gray-800 p-4 rounded-lg shadow-md"
                            >
                              <p>{participant.participantName}</p>
                            </div>
                          ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-indigo-300 flex items-center">
                <FaClipboardList className="mr-2" /> Agenda
              </h3>
              {eventDetails.agendaItems.length > 0 && (
                <div className="space-y-4 mt-4">
                  {eventDetails.agendaItems.map((agendaItem, index) => (
                    <div
                      key={index}
                      className="bg-[#005757] p-4 rounded-lg shadow-md"
                    >
                      <h5 className="text-xl font-semibold text-white">
                        {agendaItem.title}
                      </h5>
                      <p className="text-gray-200">{agendaItem.description}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(agendaItem.startTime).toLocaleString()} -{" "}
                        {new Date(agendaItem.endTime).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#2A2A2A] p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-indigo-300 flex items-center">
                <FaStar className="mr-2" /> Feedbacks
              </h3>
              {feedbacks[eventDetails.id]?.length > 0 ? (
                <>
                  <p className="text-lg text-gray-300">
                    <strong>Average Rating:</strong>{" "}
                    {renderStars(averageRatings[eventDetails.id] || 0)}
                  </p>

                  <button
                    onClick={() => toggleFeedback(eventDetails.id)}
                    className={`mt-4 px-6 py-2 rounded-lg shadow-md transition ease-in-out duration-200 ${
                      expandedFeedbacks[eventDetails.id]
                        ? "bg-indigo-500 text-white hover:bg-indigo-600"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {expandedFeedbacks[eventDetails.id]
                      ? "Hide Feedbacks"
                      : "View Feedbacks"}
                  </button>

                  {expandedFeedbacks[eventDetails.id] && (
                    <div className="space-y-4 mt-4">
                      {feedbacks[eventDetails.id].map((feedback, index) => (
                        <div
                          key={index}
                          className="bg-gray-800 p-4 rounded-lg shadow-md"
                        >
                          <p>{feedback.comments}</p>
                          <div className="mt-2 text-gray-300">
                            <p>
                              <strong>Rating:</strong>{" "}
                              {renderStars(feedback.rating)}
                            </p>
                            <p>
                              <strong>Participant:</strong>{" "}
                              {feedback.participantName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-lg text-gray-400">No feedbacks</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailsPage;
