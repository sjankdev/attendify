import React from "react";
import { useNavigate } from "react-router-dom";

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToInvitations = () => {
    navigate("/event-organizer/invitations");
  };

  return (
    <div>
      <p>Hello event organizer</p>
      <button
        onClick={handleGoToInvitations}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
        }}
      >
        Manage Invitations
      </button>
    </div>
  );
};

export default EventOrganizerPage;
