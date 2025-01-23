import React, { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const SidebarLayout: React.FC<LayoutProps> = ({
  children,
  className,
  style,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="min-h-screen bg-gradient-to-r from-[#111] to-[#222] flex flex-col lg:flex-row"
      style={style}
    >
      <div
        className={`lg:w-64 w-full p-6 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "block" : "lg:hidden"
        }`}
      >
        <div className="space-y-8">
          <h2 className="text-white text-3xl font-semibold mb-12 font-alegreya tracking-wide">
            Attendify
          </h2>
          <div className="space-y-4">
            {[
              { label: "Event Organizer", path: "/event-organizer" },
              { label: "Create Event", path: "/event-organizer/create-event" },
              { label: "Events", path: "/event-organizer/events" },
              { label: "Invitations", path: "/event-organizer/invitations" },
              {
                label: "Participants",
                path: "/event-organizer/company-participants",
              },
              {
                label: "Departments",
                path: "/event-organizer/company-departments",
              },
            ].map((item) => {
              const isItemActive = isActive(item.path);
              return (
                <div
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`cursor-pointer text-lg font-medium transition-colors duration-200 px-4 py-2 rounded-lg text-white font-roboto ${
                    isItemActive ? "text-[#BA10AA]" : ""
                  }`}
                >
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-auto">
          <img
            src="/assets/logos/login-logo.png"
            alt="Event Organizer Logo"
            className="w-32 mx-auto mt-8 opacity-80 hover:opacity-100 transition-opacity duration-200"
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
