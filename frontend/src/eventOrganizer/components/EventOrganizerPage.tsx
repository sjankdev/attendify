import React, { useState, useEffect } from "react";
import SidebarLayout from "../../shared/components/EventOrganizerLayout";
import { UpcomingEvent, EventParticipantCount } from "../../types/eventTypes";
import { fetchUpcomingEvents } from "../services/eventOrganizerService";
import { fetchUniqueParticipantsCountForThisWeek } from "../services/eventOrganizerService";

const EventOrganizerPage: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
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
    getUniqueParticipantsCount();
  }, []);

  const upcomingThisWeek = upcomingEvents.filter((event) => {
    const eventDate = new Date(event.eventStartDate);
    const today = new Date();
    const startOfWeek = today.getDate() - today.getDay();
    const endOfWeek = startOfWeek + 6;

    const startOfWeekDate = new Date(today.setDate(startOfWeek));
    const endOfWeekDate = new Date(today.setDate(endOfWeek));

    return eventDate >= startOfWeekDate && eventDate <= endOfWeekDate;
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
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between">
            <h2 className="text-2xl font-semibold mb-4 text-white">
              Upcoming Events This Week
            </h2>
            <p className="text-3xl font-bold text-white mb-4">
              {upcomingThisWeek.length} Events
            </p>

            <ul className="text-sm text-gray-200 mt-4 space-y-3 overflow-y-auto">
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
          <div className="bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 p-6 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex flex-col justify-between">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Expected Participants This Week
            </h2>
            <p className="text-3xl font-bold text-white">
              {uniqueParticipantsCount} Participants
            </p>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default EventOrganizerPage;
