import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarIcon,
  ListBulletIcon,
  BuildingOfficeIcon,
  BuildingLibraryIcon,
  UsersIcon,
  MapPinIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  fetchEventsWithParticipants,
  deleteEvent,
  reviewJoinRequest,
  fetchEventFeedbacks,
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
          loadFeedbacks(event.id);
        });
      } catch (error) {
        console.error("Failed to load events:", error);
        setError("Failed to load events.");
      }
    };
    loadEvents();
  }, [filter, departmentFilter]);

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
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setDepartmentFilter(null)}
              className={`px-4 py-2 rounded-lg font-medium ${
                departmentFilter === null
                  ? "bg-teal-600 text-white"
                  : "bg-[#313030] text-gray-300 hover:bg-gray-500"
              }`}
            >
              <BuildingLibraryIcon className="w-5 h-5 mr-2 inline" />
              All Departments
            </button>
            {departments.map((department) => (
              <button
                key={department.id}
                onClick={() => setDepartmentFilter(department.id)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  departmentFilter === department.id
                    ? "bg-teal-600 text-white"
                    : "bg-[#313030] text-gray-300 hover:bg-gray-500"
                }`}
              >
                <BuildingOfficeIcon className="w-5 h-5 mr-2 inline" />
                {department.name}
              </button>
            ))}
          </div>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-[#313030] rounded-lg shadow-lg p-6"
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

                <div className="mt-4 border-t border-gray-600 pt-4">
                  <h4 className="text-lg font-semibold text-white">
                    Event Details
                  </h4>
                  <div className="space-y-4 text-gray-300 mt-4">
                    <p className="flex items-center">
                      <MapPinIcon className="w-5 h-5 mr-2" />
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      <strong>Date:</strong>{" "}
                      {new Date(event.eventStartDate).toLocaleString()}
                    </p>
                    <p className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      <strong>End Date:</strong>{" "}
                      {new Date(event.eventEndDate).toLocaleString()}
                    </p>
                    <p className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      <strong>Join Deadline:</strong>{" "}
                      {event.joinDeadline
                        ? new Date(event.joinDeadline).toLocaleString()
                        : "N/A"}
                    </p>
                    <p className="flex items-center">
                      <UsersIcon className="w-5 h-5 mr-2" />
                      <strong>Available Seats:</strong>{" "}
                      {event.attendeeLimit === null
                        ? `${event.acceptedParticipants}/no limit`
                        : `${event.acceptedParticipants}/${event.attendeeLimit}`}
                    </p>
                    <p className="flex items-center">
                      <UsersIcon className="w-5 h-5 mr-2" />
                      <strong>Pending Requests:</strong> {event.pendingRequests}
                    </p>
                    <p className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      <strong>Available for All Departments:</strong>{" "}
                      {event.availableForAllDepartments ? "Yes" : "No"}
                    </p>
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
                    <ul className="space-y-4 mt-4">
                      {event.participants.map((participant) => (
                        <li
                          key={participant.participantId}
                          className="flex justify-between items-center bg-[#252525] p-3 rounded-lg shadow"
                        >
                          <div>
                            <p className="text-white">
                              {participant.participantName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {participant.participantEmail}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                participant.status === "PENDING"
                                  ? "bg-yellow-500 text-black"
                                  : participant.status === "ACCEPTED"
                                  ? "bg-green-500 text-white"
                                  : "bg-red-500 text-white"
                              }`}
                            >
                              {participant.status}
                            </span>
                          </div>
                          {participant.status === "PENDING" && (
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
                                className="bg-teal-600 text-white py-1 px-3 rounded-md hover:bg-teal-500"
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
                                className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-500"
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

                <div className="mt-6 border-t border-gray-600 pt-4">
                  <button
                    onClick={() => navigate(`/event-stats/${event.id}`)}
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-500 w-full mt-2"
                  >
                    View Stats
                  </button>

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() =>
                        navigate(`/event-organizer/update-event/${event.id}`)
                      }
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 w-full"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-500 w-full"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {feedbacks[event.id]?.length > 0 && (
                  <div className="mt-6 border-t border-gray-600 pt-4">
                    <h4 className="text-lg font-semibold text-white">
                      Feedback:
                    </h4>
                    <ul className="space-y-4 mt-4">
                      {feedbacks[event.id].map((feedback, index) => (
                        <li
                          key={index}
                          className="border-b border-gray-600 pb-4"
                        >
                          <p className="text-gray-300 mt-1">
                            {feedback.comments}
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            <strong>Rating:</strong> {feedback.rating} / 5
                          </p>
                          <p className="text-sm text-gray-400 mt-2">
                            <strong>Participant:</strong>{" "}
                            {feedback.participantName}
                          </p>
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
