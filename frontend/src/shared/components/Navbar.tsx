import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link to="/">Attendify</Link>
        </h1>
        <ul className="flex space-x-4">
          <li>
            <Link to="/event-organizer" className="hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/event-organizer/create-event" className="hover:underline">
              Create Event
            </Link>
          </li>
          <li>
            <Link to="/event-organizer/invitations" className="hover:underline">
              Invitations
            </Link>
          </li>
          <li>
            <Link to="/event-organizer/events" className="hover:underline">
              My events
            </Link>
          </li>
          <li>
            <Link
              to="/event-organizer/company-participants"
              className="hover:underline"
            >
              Participants
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
