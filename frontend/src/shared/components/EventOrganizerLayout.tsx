import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  className?: string;
}

const SidebarLayout: React.FC<LayoutProps> = ({ children, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#471C7E] flex flex-col lg:flex-row">
      <div
        className={`lg:w-64 w-full bg-[#471C7E] p-6 flex flex-col justify-between ${
          isSidebarOpen ? "block" : "hidden lg:block"
        }`}
      >
        <div className="space-y-6">
          <h2 className="text-[#e0e1dd] text-2xl font-bold mb-10">Attendify</h2>
          <div
            onClick={() => navigate("/event-organizer")}
            className={`flex items-center space-x-4 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
              isActive("/event-organizer") ? "bg-[#0d1b2a]" : "bg-[#57239F]"
            }`}
          >
            <FaHome className="text-2xl text-teal-400" />
            <span style={{ color: "#fffcf2" }} className="text-lg font-medium">
              Event Organizer
            </span>
          </div>

          <div className="space-y-6">
            <div
              onClick={() => navigate("/event-organizer/create-event")}
              className={`flex items-center space-x-4 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
                isActive("/event-organizer/create-event")
                  ? "bg-[#0d1b2a]"
                  : "bg-[#57239F]"
              }`}
            >
              <FaPlusCircle className="text-2xl text-teal-400" />
              <span
                style={{ color: "#fffcf2" }}
                className="text-lg font-medium"
              >
                Create Event
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/events")}
              className={`flex items-center space-x-4 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
                isActive("/event-organizer/events")
                  ? "bg-[#0d1b2a]"
                  : "bg-[#57239F]"
              }`}
            >
              <FaCalendarAlt className="text-2xl text-teal-400" />
              <span
                style={{ color: "#fffcf2" }}
                className="text-lg font-medium"
              >
                Events
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/invitations")}
              className={`flex items-center space-x-4 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
                isActive("/event-organizer/invitations")
                  ? "bg-[#0d1b2a]"
                  : "bg-[#57239F]"
              }`}
            >
              <FaClipboardList className="text-2xl text-teal-400" />
              <span
                style={{ color: "#fffcf2" }}
                className="text-lg font-medium"
              >
                Invitations
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/company-participants")}
              className={`flex items-center space-x-4 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
                isActive("/event-organizer/company-participants")
                  ? "bg-[#0d1b2a]"
                  : "bg-[#57239F]"
              }`}
            >
              <FaUsers className="text-2xl text-teal-400" />
              <span
                style={{ color: "#fffcf2" }}
                className="text-lg font-medium"
              >
                Participants
              </span>
            </div>

            <div
              onClick={() => navigate("/event-organizer/company-departments")}
              className={`flex items-center space-x-4 p-4 rounded-xl shadow-md hover:shadow-lg transition duration-300 cursor-pointer ${
                isActive("/event-organizer/company-departments")
                  ? "bg-[#0d1b2a]"
                  : "bg-[#57239F]"
              }`}
            >
              <FaBuilding className="text-2xl text-teal-400" />
              <span
                style={{ color: "#fffcf2" }}
                className="text-lg font-medium"
              >
                Departments
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

      <div className={`flex-1 p-6 ${className}`}>{children}</div>
    </div>
  );
};

export default SidebarLayout;
