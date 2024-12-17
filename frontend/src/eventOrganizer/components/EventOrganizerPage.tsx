import React from "react";
import { useNavigate } from "react-router-dom";

const EventOrganizerPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <p>Hello Event Organizer</p>
      <button
        onClick={() => navigate("/event-organizer/invitations")}
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
      <button
        onClick={() => navigate("/event-organizer/create-event")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "10px",
        }}
      >
        Create Event
      </button>
      <button
        onClick={() => navigate("/event-organizer/events")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#17a2b8",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "10px",
        }}
      >
        See Events
      </button>
      <button
        onClick={() => navigate("/event-organizer/company-participants")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#6f42c1",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginTop: "10px",
          marginLeft: "10px",
        }}
      >
        See Participants from Your Company
      </button>
    </div>
  );
};

export default EventOrganizerPage;
