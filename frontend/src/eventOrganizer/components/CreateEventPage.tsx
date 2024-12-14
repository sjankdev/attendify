import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateEventPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [attendeeLimit, setAttendeeLimit] = useState<number | null>(null);
  const [isAttendeeLimitChecked, setIsAttendeeLimitChecked] =
    useState<boolean>(false);
  const [eventDate, setEventDate] = useState<string>("");
  const [eventEndDate, setEventEndDate] = useState<string>("");
  const [joinDeadline, setJoinDeadline] = useState<string>("");
  const [joinApproval, setJoinApproval] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrganizerDetails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/auth/company",
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

  const validateDates = (): string | null => {
    if (!eventDate) return "Event date is required.";
    if (!eventEndDate) return "Event end date is required.";
    if (new Date(eventEndDate) <= new Date(eventDate))
      return "Event end date must be after the event start date.";
    if (joinDeadline && new Date(joinDeadline) >= new Date(eventDate))
      return "Join deadline must be before the event date.";
    return null;
  };

  const handleCreateEvent = async () => {
    setSuccessMessage(null);
    setError(null);

    const errorMessage = validateDates();
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    if (!organizerId) {
      setError("Organizer ID not found. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        name,
        description,
        location,
        organizerId,
        attendeeLimit: isAttendeeLimitChecked ? attendeeLimit : null,
        eventDate: new Date(eventDate).toISOString(),
        eventEndDate: new Date(eventEndDate).toISOString(),
        joinDeadline: joinDeadline
          ? new Date(joinDeadline).toISOString()
          : null,
        joinApproval,
      };

      await axios.post(
        "http://localhost:8080/api/auth/event-organizer/create-event",
        eventData,
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
      setAttendeeLimit(null);
      setIsAttendeeLimitChecked(false);
      setEventDate("");
      setEventEndDate("");
      setJoinDeadline("");
      setJoinApproval(false);
    } catch (err: any) {
      console.error("Error creating event: ", err);
      setError(err.response?.data?.message || "Failed to create the event.");
    } finally {
      setIsSubmitting(false);
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

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Event Date:
        </label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          style={{ padding: "10px", width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Event End Date:
        </label>
        <input
          type="datetime-local"
          value={eventEndDate}
          min={eventDate}
          onChange={(e) => setEventEndDate(e.target.value)}
          style={{ padding: "10px", width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>
          Join Deadline:
        </label>
        <input
          type="datetime-local"
          value={joinDeadline}
          onChange={(e) => setJoinDeadline(e.target.value)}
          max={eventDate}
          style={{ padding: "10px", width: "300px" }}
        />
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={isAttendeeLimitChecked}
            onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
          />
          Set Attendee Limit
        </label>
        {isAttendeeLimitChecked && (
          <div style={{ marginTop: "10px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Attendee Limit:
            </label>
            <input
              type="number"
              value={attendeeLimit ?? ""}
              onChange={(e) => setAttendeeLimit(Number(e.target.value))}
              placeholder="Enter attendee limit"
              style={{ padding: "10px", width: "300px" }}
              min="1"
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <label>
          <input
            type="checkbox"
            checked={joinApproval}
            onChange={(e) => setJoinApproval(e.target.checked)}
          />
          Require Join Approval
        </label>
      </div>

      <button
        onClick={handleCreateEvent}
        disabled={isSubmitting}
        style={{
          padding: "10px 20px",
          backgroundColor: isSubmitting ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          marginRight: "10px",
        }}
      >
        {isSubmitting ? "Creating..." : "Create Event"}
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
