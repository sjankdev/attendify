import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarIcon,
  ListBulletIcon,
  BuildingOfficeIcon,
  UsersIcon,
  MapPinIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

import {
  fetchEventsWithParticipants,
  deleteEvent,
  reviewJoinRequest,
  fetchEventFeedbacks,
  fetchEventFeedbackSummary,
} from "../services/eventOrganizerService";
import { Event } from "../../types/eventTypes";
import Layout from "../../shared/components/EventOrganizerLayout";

const ListEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<number, any[]>>({});
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>(
    {}
  );

  const [expandedFeedbacks, setExpandedFeedbacks] = useState<{
    [eventId: number]: boolean;
  }>({});
  const [showAccepted, setShowAccepted] = useState<{
    [eventId: number]: boolean;
  }>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [departments, setDepartments] = useState<any[]>([]);
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

  const toggleDescription = (eventId: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const toggleFeedback = (eventId: number) => {
    setExpandedFeedbacks((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const companyResponse = await axios.get(
          "http://localhost:8080/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const departmentResponse = await axios.get(
          `http://localhost:8080/api/companies/${companyResponse.data.id}/departments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDepartments(departmentResponse.data);
      } catch (err: any) {
        console.error("Error fetching departments:", err);
        setError("Failed to fetch departments.");
      }
    };

    fetchDepartments();
  }, []);

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

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { events, counts, acceptedParticipants } =
          await fetchEventsWithParticipants(
            filter,
            departmentFilter ? [departmentFilter] : []
          );

        setEvents(events);
        setCounts(counts);
        setAcceptedParticipants(acceptedParticipants);

        events.forEach((event) => {
          loadFeedbackSummary(event.id);
          loadFeedbacks(event.id);
        });
      } catch (error) {
        console.error("Failed to load events:", error);
        setError("Failed to load events.");
      }
    };
    loadEvents();
  }, [filter, departmentFilter]);

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

  const toggleAcceptedParticipants = (eventId: number) => {
    setShowAccepted((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
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

  return (
    <Layout>
      <div className="p-6 bg-[#151515] rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6">My Events</h2>
        {error && (
          <div className="text-red-500 bg-red-800 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFilter("week")}
            className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-500"
          >
            <CalendarIcon className="w-5 h-5 mr-2 inline" />
            This Week ({counts.thisWeek} Events, {acceptedParticipants.thisWeek}{" "}
            Accepted)
          </button>
          <button
            onClick={() => setFilter("month")}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500"
          >
            <CalendarIcon className="w-5 h-5 mr-2 inline" />
            This Month ({counts.thisMonth} Events,{" "}
            {acceptedParticipants.thisMonth} Accepted)
          </button>
          <button
            onClick={() => setFilter("")}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
          >
            <ListBulletIcon className="w-5 h-5 mr-2 inline" />
            All Events ({counts.allEvents} Events,{" "}
            {acceptedParticipants.allEvents} Accepted)
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 font-semibold mb-2">
            Filter by Department
          </label>
          <select
            onChange={(e) => setDepartmentFilter(Number(e.target.value))}
            value={departmentFilter ?? ""}
            className="bg-[#313030] text-gray-300 rounded-lg py-2 px-4 w-1/6 sm:w-1/8"
          >
            <option value="" className="bg-[#313030] text-gray-300">
              All Departments
            </option>
            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
                className="bg-[#313030] text-gray-300"
              >
                {department.name}
              </option>
            ))}
          </select>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="relative bg-[#313030] rounded-lg shadow-lg p-6"
              >
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => navigate(`/event-stats/${event.id}`)}
                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-500"
                    title="View Stats"
                  >
                    <ChartBarIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/event-organizer/update-event/${event.id}`)
                    }
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-500"
                    title="Edit Event"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500"
                    title="Delete Event"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-2xl font-semibold text-white">
                  {event.name}
                </h3>
                <p className="text-gray-400 mt-2">
                  {expandedDescriptions[event.id]
                    ? event.description
                    : event.description.length > 100
                    ? `${event.description.slice(0, 100)}...`
                    : event.description}
                </p>
                {event.description.length > 100 && (
                  <button
                    onClick={() => toggleDescription(event.id)}
                    className="text-teal-400 mt-2 hover:underline"
                  >
                    {expandedDescriptions[event.id] ? "View Less" : "View More"}
                  </button>
                )}

                <div className="mt-6 border-t border-gray-600 pt-6">
                  <h4 className="text-xl font-semibold text-white mb-4">
                    Event Details
                  </h4>
                  <div className="space-y-6 text-gray-300">
                    <div className="space-y-4">
                      <p className="flex items-center space-x-3">
                        <MapPinIcon className="w-6 h-6 text-blue-500" />
                        <strong className="text-sm">Location:</strong>{" "}
                        <span>{event.location}</span>
                      </p>
                    </div>
                    <hr className="border-t border-gray-700" />

                    <div className="space-y-4">
                      <p className="flex items-center space-x-3">
                        <CalendarIcon className="w-6 h-6 text-green-500" />
                        <strong className="text-sm">Start Date:</strong>
                        <span>
                          {new Date(event.eventStartDate).toLocaleString()}
                        </span>
                      </p>
                      <p className="flex items-center space-x-3">
                        <CalendarIcon className="w-6 h-6 text-red-500" />
                        <strong className="text-sm">End Date:</strong>
                        <span>
                          {new Date(event.eventEndDate).toLocaleString()}
                        </span>
                      </p>
                      <p className="flex items-center space-x-3">
                        <CalendarIcon className="w-6 h-6 text-yellow-500" />
                        <strong className="text-sm">Join Deadline:</strong>
                        <span>
                          {event.joinDeadline
                            ? new Date(event.joinDeadline).toLocaleString()
                            : "No deadline"}
                        </span>
                      </p>
                    </div>
                    <hr className="border-t border-gray-700" />

                    <div className="space-y-4">
                      <p className="flex items-center space-x-3">
                        <UsersIcon className="w-6 h-6 text-purple-500" />
                        <strong className="text-sm">Available Seats:</strong>
                        <span>
                          {event.attendeeLimit === null
                            ? `${event.acceptedParticipants}/no limit`
                            : `${event.acceptedParticipants}/${event.attendeeLimit}`}
                        </span>
                      </p>
                      <p className="flex items-center space-x-3">
                        <UsersIcon className="w-6 h-6 text-orange-500" />
                        <strong className="text-sm">Pending Requests:</strong>
                        <span>{event.pendingRequests}</span>
                      </p>
                      <p className="flex items-center space-x-3">
                        <CheckCircleIcon className="w-6 h-6 text-teal-500" />
                        <strong className="text-sm">
                          Available for All Departments:
                        </strong>
                        <span>
                          {event.availableForAllDepartments ? "Yes" : "No"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {event.departments && event.departments.length > 0 && (
                  <div className="mt-6 border-t border-gray-600 pt-4">
                    <h4 className="text-lg font-semibold text-white">
                      Departments
                    </h4>
                    <p className="text-gray-300 mt-4 flex items-center">
                      <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                      <strong>Departments:</strong>{" "}
                      {event.departments.map((dept, index) => (
                        <span key={index}>
                          {dept.name}
                          {index < event.departments.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  </div>
                )}

                {event.agendaItems.length > 0 && (
                  <div className="mt-6 border-t border-gray-600 pt-4">
                    <h4 className="text-lg font-semibold text-white flex items-center">
                      <ListBulletIcon className="w-5 h-5 mr-2" />
                      Agenda:
                    </h4>
                    <ul className="space-y-4 mt-4">
                      {event.agendaItems.map((agendaItem, index) => (
                        <li
                          key={index}
                          className="border-b border-gray-600 pb-4"
                        >
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

                {event.participants?.length > 0 && (
                  <div className="mt-6 border-t border-gray-600 pt-4">
                    <h4 className="text-lg font-semibold text-white">
                      Participants:
                    </h4>

                    <div className="mt-4">
                      <h5 className="text-white">
                        Joined participants:{" "}
                        {
                          event.participants.filter(
                            (p) => p.status === "ACCEPTED"
                          ).length
                        }
                      </h5>
                      <button
                        className="mt-2 text-teal-600 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onClick={() => toggleAcceptedParticipants(event.id)}
                      >
                        {showAccepted[event.id] ? "Hide" : "View"} accepted
                        participants
                      </button>
                    </div>

                    {showAccepted[event.id] &&
                      event.participants.filter((p) => p.status === "ACCEPTED")
                        .length > 0 && (
                        <ul className="space-y-4 mt-4">
                          {event.participants
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

                    {event.participants.filter((p) => p.status === "PENDING")
                      .length > 0 && (
                      <div className="mt-6">
                        <h5 className="text-white">Pending participants</h5>
                        <ul className="space-y-4 mt-4">
                          {event.participants
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
                                        event.id,
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
                                        event.id,
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

                <div className="mt-6 border-t border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-white">
                    Feedbacks:
                  </h4>

                  {feedbacks[event.id]?.length > 0 ? (
                    <>
                      <p className="text-gray-300 mt-2">
                        <strong className="font-medium">Average Rating:</strong>{" "}
                        {renderStars(averageRatings[event.id] || 0)}
                      </p>

                      <button
                        onClick={() => toggleFeedback(event.id)}
                        className="mt-2 text-teal-600 hover:text-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {expandedFeedbacks[event.id]
                          ? "Hide Feedbacks"
                          : "View Feedbacks"}
                      </button>

                      {expandedFeedbacks[event.id] && (
                        <ul className="space-y-4 mt-4 bg-gray-800 rounded-lg p-4">
                          {feedbacks[event.id].map((feedback, index) => (
                            <li
                              key={index}
                              className="border-b border-gray-600 pb-4 last:border-none"
                            >
                              <p className="text-gray-300">
                                {feedback.comments}
                              </p>

                              <div className="mt-2 text-sm text-gray-400">
                                <p>
                                  <strong className="font-medium">
                                    Rating:
                                  </strong>{" "}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListEventsPage;
