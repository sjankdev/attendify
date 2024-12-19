import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AgendaItemDTO } from "../../types/eventTypes";

const CreateEventPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [attendeeLimit, setAttendeeLimit] = useState<number | null>(null);
  const [isAttendeeLimitChecked, setIsAttendeeLimitChecked] = useState<boolean>(false);
  const [eventDate, setEventDate] = useState<string>("");
  const [eventEndDate, setEventEndDate] = useState<string>("");
  const [joinDeadline, setJoinDeadline] = useState<string>("");
  const [joinApproval, setJoinApproval] = useState<boolean>(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItemDTO[]>([{ title: "", description: "", startTime: "", endTime: "" }]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
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

  const validateDates = (): boolean => {
    const errors: string[] = [];
    const eventStart = new Date(eventDate);
    const eventEnd = new Date(eventEndDate);
    const join = joinDeadline ? new Date(joinDeadline) : null;

    if (isAttendeeLimitChecked && (attendeeLimit === null || attendeeLimit < 1)) {
      errors.push("Attendee limit must be at least 1.");
    }

    if (eventStart >= eventEnd) {
      errors.push("Event start date must be before the event end date.");
    }

    if (join && join >= eventStart) {
      errors.push("Join deadline must be before the event start date.");
    }

    agendaItems.forEach((item, index) => {
      const start = new Date(item.startTime);
      const end = new Date(item.endTime);

      if (start < eventStart || end > eventEnd) {
        errors.push(`Agenda item ${index + 1}: Times must be within event duration.`);
      }

      if (start >= end) {
        errors.push(`Agenda item ${index + 1}: Start time must be before end time.`);
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleCreateEvent = async () => {
    setSuccessMessage(null);
    setError(null);

    if (isAttendeeLimitChecked && attendeeLimit === null) {
      setError("Please specify an attendee limit.");
      return;
    }

    if (isAttendeeLimitChecked && attendeeLimit === 0) {
      setError("Attendee limit must be at least 1.");
      return;
    }

    if (!organizerId) {
      setError("Organizer ID not found. Please try again.");
      return;
    }

    if (!validateDates()) {
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
        joinDeadline: joinDeadline ? new Date(joinDeadline).toISOString() : null,
        joinApproval,
        agendaItems: agendaItems.map((item) => ({
          ...item,
          startTime: new Date(item.startTime).toISOString(),
          endTime: new Date(item.endTime).toISOString(),
        })),
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
      setAgendaItems([{ title: "", description: "", startTime: "", endTime: "" }]);
    } catch (err: any) {
      console.error("Error creating event: ", err);
      setError(err.response?.data.message || "Failed to create the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAgendaItemChange = (index: number, field: keyof AgendaItemDTO, value: string) => {
    const updatedAgendaItems = [...agendaItems];
    updatedAgendaItems[index][field] = value;
    setAgendaItems(updatedAgendaItems);
  };

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, { title: "", description: "", startTime: "", endTime: "" }]);
  };

  const removeAgendaItem = (index: number) => {
    const updatedAgendaItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgendaItems);
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" }}>
      <h2 style={{ color: "#333", fontSize: "24px", marginBottom: "20px" }}>Create Event</h2>

      {successMessage && (
        <div style={{ color: "green", marginBottom: "20px", padding: "10px", backgroundColor: "#d4edda", borderRadius: "5px" }}>
          {successMessage}
        </div>
      )}
      {error && (
        <div style={{ color: "red", marginBottom: "20px", padding: "10px", backgroundColor: "#f8d7da", borderRadius: "5px" }}>
          {error}
        </div>
      )}
      {validationErrors.length > 0 && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          <ul>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Event Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter event name"
          style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Event Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          style={{ padding: "12px", width: "100%", height: "100px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Event Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter event location"
          style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Event Date:</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Event End Date:</label>
        <input
          type="datetime-local"
          value={eventEndDate}
          onChange={(e) => setEventEndDate(e.target.value)}
          style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Join Deadline:</label>
        <input
          type="datetime-local"
          value={joinDeadline}
          onChange={(e) => setJoinDeadline(e.target.value)}
          style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "600" }}>
          <input
            type="checkbox"
            checked={isAttendeeLimitChecked}
            onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
            style={{ marginRight: "10px" }}
          />
          Set Attendee Limit
        </label>
        {isAttendeeLimitChecked && (
          <div style={{ marginTop: "10px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Attendee Limit:</label>
            <input
              type="number"
              value={attendeeLimit ?? ""}
              onChange={(e) => setAttendeeLimit(Number(e.target.value))}
              placeholder="Enter attendee limit"
              style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
              min="1"
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label style={{ fontWeight: "600" }}>
          <input
            type="checkbox"
            checked={joinApproval}
            onChange={(e) => setJoinApproval(e.target.checked)}
            style={{ marginRight: "10px" }}
          />
          Require Join Approval
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ fontSize: "20px", marginBottom: "10px" }}>Agenda Items</h3>
        {agendaItems.map((item, index) => (
          <div key={index} style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "18px", marginBottom: "10px" }}>Agenda Item {index + 1}</h4>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Title:</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleAgendaItemChange(index, "title", e.target.value)}
              placeholder="Enter agenda title"
              style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Description:</label>
            <textarea
              value={item.description}
              onChange={(e) => handleAgendaItemChange(index, "description", e.target.value)}
              placeholder="Enter agenda description"
              style={{ padding: "12px", width: "100%", height: "100px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>Start Time:</label>
            <input
              type="datetime-local"
              value={item.startTime}
              onChange={(e) => handleAgendaItemChange(index, "startTime", e.target.value)}
              style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600" }}>End Time:</label>
            <input
              type="datetime-local"
              value={item.endTime}
              onChange={(e) => handleAgendaItemChange(index, "endTime", e.target.value)}
              style={{ padding: "12px", width: "100%", borderRadius: "5px", border: "1px solid #ccc", fontSize: "16px" }}
            />

            <button
              type="button"
              onClick={() => removeAgendaItem(index)}
              style={{
                backgroundColor: "#e74c3c",
                color: "#fff",
                padding: "10px",
                borderRadius: "5px",
                border: "none",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Remove Agenda Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAgendaItem}
          style={{
            backgroundColor: "#3498db",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Add Agenda Item
        </button>
      </div>

      <button
        onClick={handleCreateEvent}
        disabled={isSubmitting}
        style={{
          backgroundColor: "#2ecc71",
          color: "#fff",
          padding: "15px",
          width: "100%",
          borderRadius: "5px",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        {isSubmitting ? "Creating Event..." : "Create Event"}
      </button>

      <button
        onClick={handleGoBack}
        style={{
          backgroundColor: "#f39c12",
          color: "#fff",
          padding: "15px",
          width: "100%",
          borderRadius: "5px",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
          marginTop: "15px",
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default CreateEventPage;
