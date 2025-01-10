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
  FaCalendar,
  FaCalendarWeek,
} from "react-icons/fa";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const SidebarLayout: React.FC<LayoutProps> = ({ children, className }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            onClick={() => navigate("/event-participant")}
            className="flex items-center space-x-4 p-4 rounded-xl bg-[#57239F] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
          >
            <FaHome className="text-2xl text-teal-400" />
            <span style={{ color: "#fffcf2" }} className="text-lg font-medium">
              Event Participant
            </span>
          </div>
          <div
            onClick={() => navigate("/event-participant-upcoming-events")}
            className="flex items-center space-x-4 p-4 rounded-xl bg-[#57239F] shadow-md hover:shadow-lg hover:bg-[#0d1b2a] transition duration-300 cursor-pointer"
          >
            <FaCalendar className="text-2xl text-teal-400" />
            <span style={{ color: "#fffcf2" }} className="text-lg font-medium">
              Joined Events
            </span>
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
