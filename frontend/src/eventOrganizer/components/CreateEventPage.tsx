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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Event</h2>

      {successMessage && (
        <div className="bg-green-100 text-green-800 p-4 mb-6 rounded-md">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-800 p-4 mb-6 rounded-md">
          {error}
        </div>
      )}
      {validationErrors.length > 0 && (
        <div className="text-red-600 mb-6">
          <ul>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Event Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter event name"
          className="w-full p-3 border rounded-md border-gray-300 text-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Event Description:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter event description"
          className="w-full p-3 border rounded-md border-gray-300 text-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Event Location:</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter event location"
          className="w-full p-3 border rounded-md border-gray-300 text-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Event Date:</label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full p-3 border rounded-md border-gray-300 text-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Event End Date:</label>
        <input
          type="datetime-local"
          value={eventEndDate}
          onChange={(e) => setEventEndDate(e.target.value)}
          className="w-full p-3 border rounded-md border-gray-300 text-lg"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Join Deadline:</label>
        <input
          type="datetime-local"
          value={joinDeadline}
          onChange={(e) => setJoinDeadline(e.target.value)}
          className="w-full p-3 border rounded-md border-gray-300 text-lg"
        />
      </div>

      <div className="mb-4 flex items-center">
        <label className="font-semibold text-gray-700 mr-2">
          <input
            type="checkbox"
            checked={isAttendeeLimitChecked}
            onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
            className="mr-2"
          />
          Set Attendee Limit
        </label>
        {isAttendeeLimitChecked && (
          <input
            type="number"
            value={attendeeLimit ?? ""}
            onChange={(e) => setAttendeeLimit(Number(e.target.value))}
            placeholder="Enter attendee limit"
            className="p-3 border rounded-md border-gray-300 text-lg"
            min="1"
          />
        )}
      </div>

      <div className="mb-4">
        <label className="font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={joinApproval}
            onChange={(e) => setJoinApproval(e.target.checked)}
            className="mr-2"
          />
          Require Join Approval
        </label>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Agenda Items</h3>
        {agendaItems.map((item, index) => (
          <div key={index} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-700">Agenda Item {index + 1}</h4>

            <label className="block text-sm font-semibold text-gray-700 mb-2">Title:</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => handleAgendaItemChange(index, "title", e.target.value)}
              placeholder="Enter agenda title"
              className="w-full p-3 border rounded-md border-gray-300 text-lg"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Description:</label>
            <textarea
              value={item.description}
              onChange={(e) => handleAgendaItemChange(index, "description", e.target.value)}
              placeholder="Enter agenda description"
              className="w-full p-3 border rounded-md border-gray-300 text-lg"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time:</label>
            <input
              type="datetime-local"
              value={item.startTime}
              onChange={(e) => handleAgendaItemChange(index, "startTime", e.target.value)}
              className="w-full p-3 border rounded-md border-gray-300 text-lg"
            />

            <label className="block text-sm font-semibold text-gray-700 mb-2">End Time:</label>
            <input
              type="datetime-local"
              value={item.endTime}
              onChange={(e) => handleAgendaItemChange(index, "endTime", e.target.value)}
              className="w-full p-3 border rounded-md border-gray-300 text-lg"
            />

            <button
              type="button"
              onClick={() => removeAgendaItem(index)}
              className="bg-red-500 text-white p-3 mt-2 rounded-md"
            >
              Remove Agenda Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addAgendaItem}
          className="bg-blue-500 text-white p-3 rounded-md"
        >
          Add Agenda Item
        </button>
      </div>

      <button
        onClick={handleCreateEvent}
        disabled={isSubmitting}
        className="bg-green-500 text-white p-4 rounded-md w-full text-lg"
      >
        {isSubmitting ? "Creating Event..." : "Create Event"}
      </button>

      <button
        onClick={handleGoBack}
        className="bg-yellow-500 text-white p-4 rounded-md w-full text-lg mt-4"
      >
        Go Back
      </button>
    </div>
  );
};

export default CreateEventPage;
