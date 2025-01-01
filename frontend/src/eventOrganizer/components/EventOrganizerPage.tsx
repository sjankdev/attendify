import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../shared/components/Layout";

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome, Event Organizer!
        </h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl">
          Manage events, invitations, and participants seamlessly with
          Attendify.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div
            onClick={() => navigate("/event-organizer/create-event")}
            className="cursor-pointer p-4 bg-green-100 rounded-lg shadow hover:bg-green-200 transition duration-300"
          >
            <h2 className="text-xl font-bold text-green-800 mb-2">
              Create Event
            </h2>
            <p className="text-sm text-green-700">
              Start organizing your next event with ease.
            </p>
          </div>
          <div
            onClick={() => navigate("/event-organizer/invitations")}
            className="cursor-pointer p-4 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition duration-300"
          >
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              Manage Invitations
            </h2>
            <p className="text-sm text-blue-700">
              View and manage event invitations for participants.
            </p>
          </div>
          <div
            onClick={() => navigate("/event-organizer/events")}
            className="cursor-pointer p-4 bg-teal-100 rounded-lg shadow hover:bg-teal-200 transition duration-300"
          >
            <h2 className="text-xl font-bold text-teal-800 mb-2">See Events</h2>
            <p className="text-sm text-teal-700">
              Browse and manage your existing events.
            </p>
          </div>
          <div
            onClick={() => navigate("/event-organizer/company-participants")}
            className="cursor-pointer p-4 bg-purple-100 rounded-lg shadow hover:bg-purple-200 transition duration-300"
          >
            <h2 className="text-xl font-bold text-purple-800 mb-2">
              Company Participants
            </h2>
            <p className="text-sm text-purple-700">
              View participants from your organization.
            </p>
          </div>
          <div
            onClick={() => navigate("/event-organizer/company-departments")}
            className="cursor-pointer p-4 bg-purple-100 rounded-lg shadow hover:bg-purple-200 transition duration-300"
          >
            <h2 className="text-xl font-bold text-purple-800 mb-2">
              Company Departments
            </h2>
            <p className="text-sm text-purple-700">
              View departments from your company.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700">
            Need help?{" "}
            <a href="/support" className="text-blue-600 underline">
              Contact support
            </a>
            .
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default EventOrganizerPage;
