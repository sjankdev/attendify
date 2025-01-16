import React from "react";
import SidebarLayout from "../../shared/components/EventOrganizerLayout";

const EventOrganizerPage: React.FC = () => {
  return (
    <SidebarLayout className="bg-[#151515] text-white">
      <div className="flex flex-col p-8">
        <h1 className="text-4xl font-bold mb-6">Event Organizer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">Upcoming Events</h2>
            <p className="text-xl mt-2">5</p>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">Total Participants</h2>
            <p className="text-xl mt-2">120</p>
          </div>
          <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold">Active Invitations</h2>
            <p className="text-xl mt-2">15</p>
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Recent Events</h2>
          <ul>
            <li className="text-lg mb-2">Annual Company Meetup - Jan 20, 2025</li>
            <li className="text-lg mb-2">Team Building Activity - Feb 15, 2025</li>
            <li className="text-lg mb-2">Product Launch Event - Mar 10, 2025</li>
          </ul>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default EventOrganizerPage;
