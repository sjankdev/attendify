import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateEventPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      try {
        const response = await axios.get(
          "https://attendify-backend-el2r.onrender.com/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrganizerId(response.data.owner.id);
      } catch (err) {
        console.error("Error fetching organizer details: ", err);
        setError("Failed to fetch organizer details.");
      }
    };

    fetchOrganizerDetails();
  }, []);

  const handleCreateEvent = async () => {
    setSuccessMessage(null);
    setError(null);

    if (!organizerId) {
      setError("Organizer ID not found. Please try again.");
      return;
    }

    try {
      const response = await axios.post(
        "https://attendify-backend-el2r.onrender.com/event-participant/api/auth/event-organizer/create-event",
        { name, description, location, organizerId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccessMessage("Event created successfully!");
      setName("");
      setDescription("");
      setLocation("");
    } catch (err: any) {
      console.error("Error creating event: ", err);
      setError(err.response?.data?.message || "Failed to create the event.");
    }
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  return (
    <div>
      <h2>Create Event</h2>
      {successMessage && (
        <div style={{ color: "green", marginBottom: "10px" }}>
          {successMessage}
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter event name"
          style={{ padding: "10px", width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Description:
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          style={{ padding: "10px", width: "300px", height: "100px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Location:
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter event location"
          style={{ padding: "10px", width: "300px" }}
        />
      </div>

      <button
        onClick={handleCreateEvent}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          cursor: "pointer",
          marginRight: "10px",
        }}
      >
        Create Event
      </button>

      <button
        onClick={handleGoBack}
        style={{
          padding: "10px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default CreateEventPage;
