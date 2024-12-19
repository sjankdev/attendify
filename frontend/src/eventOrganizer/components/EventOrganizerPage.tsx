import React from "react";
import { useNavigate } from "react-router-dom";

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome, Event Organizer!</h1>
      <p className="text-lg text-gray-600 mb-6 text-center max-w-2xl">
        As the Event Organizer, you have the ability to manage events, invitations, and participants within your organization. 
        Use the options below to easily create events, invite participants, and view all relevant event details.
      </p>
      <div className="flex flex-wrap gap-6">
        <button
          onClick={() => navigate("/event-organizer/invitations")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
        >
          Manage Invitations
        </button>
        <button
          onClick={() => navigate("/event-organizer/create-event")}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
        >
          Create Event
        </button>
        <button
          onClick={() => navigate("/event-organizer/events")}
          className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg shadow-lg hover:bg-teal-700 transition duration-300 transform hover:scale-105"
        >
          See Events
        </button>
        <button
          onClick={() => navigate("/event-organizer/company-participants")}
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105"
        >
          See Participants from Your Company
        </button>
      </div>
      <div className="mt-8 bg-white p-4 rounded-lg shadow-md text-center">
        <p className="text-xl font-semibold text-gray-700 mb-2">Need Help?</p>
        <p className="text-gray-600">If you have any questions about managing events, please contact support.</p>
      </div>
    </div>
  );
};

export default EventOrganizerPage;
