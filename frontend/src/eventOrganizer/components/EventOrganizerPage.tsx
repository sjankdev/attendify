import React, { useState, useEffect } from "react";
import SidebarLayout from "../../shared/components/EventOrganizerLayout";
import { UpcomingEvent } from "../../types/eventTypes";
import { fetchUpcomingEvents } from "../services/eventOrganizerService";

const EventOrganizerPage: React.FC = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  useEffect(() => {
    const getUpcomingEvents = async () => {
      try {
        const events = await fetchUpcomingEvents();
        setUpcomingEvents(events);
      } catch (error) {
        console.error("Error fetching upcoming events:", error);
      }
    };

    getUpcomingEvents();
  }, []);

  return (
    <SidebarLayout className="bg-[#151515] text-white">
      <div className="flex flex-col p-8">
        <h1 className="text-4xl font-bold mb-6">Event Organizer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            <p className="text-xl mt-2">{upcomingEvents.length}</p>
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
          <ul>
            {upcomingEvents.map((event) => (
              <li key={event.id} className="text-lg mb-2">
                {event.name} -{" "}
                {new Date(event.eventStartDate).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default EventOrganizerPage;
