import React, { useState, useEffect } from "react";
import SidebarLayout from "../../shared/components/EventOrganizerLayout";
import { UpcomingEvent } from "../../types/eventTypes";
import {
  fetchUpcomingEvents,
  fetchPastMonthEvents,
} from "../services/eventOrganizerService";
import { fetchUniqueParticipantsCountForThisWeek } from "../services/eventOrganizerService";

const EventOrganizerPage: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [pastMonthEvents, setPastMonthEvents] = useState<UpcomingEvent[]>([]);
  const [uniqueParticipantsCount, setUniqueParticipantsCount] =
    useState<number>(0);
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    const getUpcomingEvents = async () => {
      try {
        const events = await fetchUpcomingEvents();
        setUpcomingEvents(events);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };

    const getPastMonthEvents = async () => {
      try {
        const events = await fetchPastMonthEvents();
        setPastMonthEvents(events);
      } catch (error) {
        console.error("Error fetching past month's events:", error);
      }
    };

    const getUniqueParticipantsCount = async () => {
      try {
        const uniqueParticipants =
          await fetchUniqueParticipantsCountForThisWeek();
        setUniqueParticipantsCount(uniqueParticipants);
      } catch (error) {
        console.error("Error fetching unique participants count:", error);
      }
    };

    getUpcomingEvents();
    getPastMonthEvents();
    getUniqueParticipantsCount();
  }, []);

  const upcomingThisWeek = upcomingEvents.filter((event) => {
    const eventDate = new Date(event.eventStartDate);
    const today = new Date();
    const dayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(
      today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });

  const visibleEvents = showAllEvents
    ? upcomingThisWeek
    : upcomingThisWeek.slice(0, 5);

  return (
    <SidebarLayout className="bg-[#1f1f1f] text-white">
      <div className="flex flex-col p-8 space-y-12">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
          Event Organizer Dashboard
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Upcoming Events This Week
            </h2>
            <p className="text-3xl font-bold text-white mb-4">
              {upcomingThisWeek.length} Events
            </p>
            <ul className="text-sm text-gray-200 mt-4 space-y-3 overflow-y-auto flex-1">
              {visibleEvents.map((event) => (
                <li key={event.id} className="truncate">
                  <strong>{event.name}</strong> -{" "}
                  {new Date(event.eventStartDate).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  <br />
                </li>
              ))}
            </ul>
            {upcomingThisWeek.length > 5 && !showAllEvents && (
              <button
                onClick={() => setShowAllEvents(true)}
                className="text-blue-500 mt-4 hover:underline transition duration-200"
              >
                See More
              </button>
            )}
            {showAllEvents && upcomingThisWeek.length > 5 && (
              <button
                onClick={() => setShowAllEvents(false)}
                className="text-blue-500 mt-4 hover:underline transition duration-200"
              >
                See Less
              </button>
            )}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Events in the Past Month
            </h2>
            <p className="text-3xl font-bold text-white mb-4">
              {pastMonthEvents.length} Events
            </p>
            <ul className="text-sm text-gray-200 mt-4 space-y-3 overflow-y-auto flex-1">
              {pastMonthEvents.slice(0, 5).map((event) => (
                <li key={event.id} className="truncate">
                  <strong>{event.name}</strong> -{" "}
                  {new Date(event.eventStartDate).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
                  <br />
                </li>
              ))}
            </ul>
            {pastMonthEvents.length > 5 && (
              <button
                onClick={() => setShowAllEvents((prev) => !prev)}
                className="text-blue-500 mt-4 hover:underline transition duration-200"
              >
                {showAllEvents ? "See Less" : "See More"}
              </button>
            )}
          </div>

          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Expected Participants This Week
            </h2>
            <p className="text-3xl font-bold text-white mb-4">
              {uniqueParticipantsCount} Participants
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default EventOrganizerPage;
