import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    <Layout
      className="text-white"
      style={{
        backgroundImage: `url('/assets/organizer-homepage/home-bg-1.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <h2 className="text-3xl font-bold text-white mb-6">My Events</h2>
      {error && (
        <div className="text-red-500 bg-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex items-center space-x-6">
        <div className="w-1/5">
          <label className="block text-white-400 font-medium mb-2 tracking-wide">
            Filter by Date
          </label>
          <select
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
            className="bg-[#2A0C6F] text-gray-300 border border-gray-500 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow hover:border-blue-500"
          >
            <option value="" className="bg-[#11011E] text-gray-300">
              All Events ({counts.allEvents} Events,{" "}
              {acceptedParticipants.allEvents} Accepted)
            </option>
            <option value="week" className="bg-[#11011E] text-gray-300">
              This Week ({counts.thisWeek} Events,{" "}
              {acceptedParticipants.thisWeek} Accepted)
            </option>
            <option value="month" className="bg-[#11011E] text-gray-300">
              This Month ({counts.thisMonth} Events,{" "}
              {acceptedParticipants.thisMonth} Accepted)
            </option>
          </select>
        </div>

        <div className="w-1/5">
          <label className="block text-white-400 font-medium mb-2 tracking-wide">
            Filter by Department
          </label>
          <select
            onChange={(e) => setDepartmentFilter(Number(e.target.value))}
            value={departmentFilter ?? ""}
            className="bg-[#2A0C6F] text-gray-300 border border-gray-500 rounded-lg py-2 px-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow hover:border-blue-500"
          >
            <option value="" className="bg-[#11011E] text-gray-300">
              All Departments
            </option>
            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
                className="bg-[#11011E] text-gray-300"
              >
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-gray-500">No events found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative bg-[#11011E] rounded-lg shadow-lg p-6"
            >
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
                <div className="space-y-6 text-gray-300">
                  <div className="space-y-4">
                    <p className="flex items-center space-x-3">
                      <MapPinIcon className="w-6 h-6 text-blue-500" />
                      <strong className="text-sm">Location:</strong>{" "}
                      <span>{event.location}</span>
                    </p>
                    <p className="flex items-center space-x-3">
                      <CalendarIcon className="w-6 h-6 text-green-500" />
                      <strong className="text-sm">Start Date:</strong>
                      <span>
                        {new Intl.DateTimeFormat("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(event.eventStartDate))}{" "}
                        at{" "}
                        {new Intl.DateTimeFormat("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: false,
                        }).format(new Date(event.eventStartDate))}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {event.participants?.some(
                (participant) => participant.status === "PENDING"
              ) && (
                <div className="mt-6 bg-[#2c2c2c] p-4 rounded-lg">
                  <h4 className="text-xl text-white">Pending Join Requests:</h4>
                  {event.participants
                    ?.filter((participant) => participant.status === "PENDING")
                    .map((participant) => (
                      <div
                        key={participant.participantId}
                        className="flex items-center space-x-4"
                      >
                        <span className="text-gray-400">
                          {participant.participantName}
                        </span>
                        <div className="space-x-2">
                          <button
                            onClick={() =>
                              handleReviewJoinRequest(
                                event.id,
                                participant.participantId,
                                "ACCEPTED"
                              )
                            }
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-500"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleReviewJoinRequest(
                                event.id,
                                participant.participantId,
                                "REJECTED"
                              )
                            }
                            className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <Link
                to={`/event-details/${event.id}`}
                className="text-blue-400 hover:underline mt-4 inline-block"
              >
                See Full Event
              </Link>
              <div className="absolute bottom-4 right-4 flex space-x-2">
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
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default ListEventsPage;
