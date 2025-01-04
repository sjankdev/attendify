import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlusCircle,
  FaClipboardList,
  FaCalendarAlt,
  FaUsers,
  FaBuilding,
  FaHome,
  FaBars,
} from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#0d1b2a] flex flex-col lg:flex-row">
      <div
        className={`lg:w-64 w-full bg-[#1b263b] p-6 flex flex-col justify-between ${
          isSidebarOpen ? "block" : "hidden lg:block"
        }`}
      >
        <div className="space-y-6">
          <h2 className="text-[#e0e1dd] text-2xl font-bold mb-10">Attendify</h2>
          <div
            onClick={() => navigate("/event-organizer")}
            className="flex items-center space-x-4 p-4 rounded-xl bg-[#1b263b] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
          >
            <FaHome className="text-2xl text-teal-400" />
            <span className="text-teal-400 text-lg font-medium">
              Event Organizer
            </span>
          </div>

          <div className="space-y-6">
            <div
              onClick={() => navigate("/event-organizer/create-event")}
              className="flex items-center space-x-4 p-4 rounded-xl bg-[#1b263b] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
            >
              <FaPlusCircle className="text-2xl text-teal-400" />
              <span className="text-teal-400 text-lg font-medium">
                Create Event
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/invitations")}
              className="flex items-center space-x-4 p-4 rounded-xl bg-[#1b263b] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
            >
              <FaClipboardList className="text-2xl text-teal-400" />
              <span className="text-teal-400 text-lg font-medium">
                Manage Invitations
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/events")}
              className="flex items-center space-x-4 p-4 rounded-xl bg-[#1b263b] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
            >
              <FaCalendarAlt className="text-2xl text-teal-400" />
              <span className="text-teal-400 text-lg font-medium">
                See Events
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/company-participants")}
              className="flex items-center space-x-4 p-4 rounded-xl bg-[#1b263b] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
            >
              <FaUsers className="text-2xl text-teal-400" />
              <span className="text-teal-400 text-lg font-medium">
                Company Participants
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/company-departments")}
              className="flex items-center space-x-4 p-4 rounded-xl bg-[#1b263b] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
            >
              <FaBuilding className="text-2xl text-teal-400" />
              <span className="text-teal-400 text-lg font-medium">
                Company Departments
              </span>
            </div>
          </div>
        </div>
        <div className="mt-auto">
          <img
            src="/assets/logos/login-logo.png"
            alt="Event Organizer Logo"
            className="w-28 mx-auto mt-8"
          />
        </div>
      </div>

      <div className="lg:hidden p-4 flex items-center">
        <FaBars
          className="text-2xl text-teal-400 cursor-pointer"
          onClick={toggleSidebar}
        />
      </div>

      <div className="flex-1 p-6">{children}</div>
    </div>
  );
};

export default SidebarLayout;
