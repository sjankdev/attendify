import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [departmentFilter, setDepartmentFilter] = useState<number | null>(null);

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
            This Week ({counts.thisWeek} Events, {acceptedParticipants.thisWeek}{" "}
            Accepted)
          </button>
          <button
            onClick={() => setFilter("month")}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500"
          >
            This Month ({counts.thisMonth} Events,{" "}
            {acceptedParticipants.thisMonth} Accepted)
          </button>
          <button
            onClick={() => setFilter("")}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
          >
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
                <p className="text-gray-400 mt-2">{event.description}</p>

                <div className="mt-4 space-y-2 text-gray-300">
                  <p>
                    <strong>Location:</strong> {event.location}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(event.eventStartDate).toLocaleString()}
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
                    <strong>Available Seats:</strong>{" "}
                    {event.attendeeLimit === null
                      ? `${event.acceptedParticipants}/no limit`
                      : `${event.acceptedParticipants}/${event.attendeeLimit}`}
                  </p>
                  <p>
                    <strong>Pending Requests:</strong> {event.pendingRequests}
                  </p>
                  <p>
                    <strong>Available for All Departments:</strong>{" "}
                    {event.availableForAllDepartments ? "Yes" : "No"}
                  </p>
                  {event.departments && event.departments.length > 0 && (
                    <p>
                      <strong>Departments:</strong>{" "}
                      {event.departments.map((dept, index) => (
                        <span key={index}>
                          {dept.name}
                          {index < event.departments.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ListEventsPage;
