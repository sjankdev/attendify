import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AgendaItemDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";

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
  const [agendaItems, setAgendaItems] = useState<AgendaItemDTO[]>([
    { title: "", description: "", startTime: "", endTime: "" },
  ]);

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

    if (
      isAttendeeLimitChecked &&
      (attendeeLimit === null || attendeeLimit < 1)
    ) {
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
        errors.push(
          `Agenda item ${index + 1}: Times must be within event duration.`
        );
      }

      if (start >= end) {
        errors.push(
          `Agenda item ${index + 1}: Start time must be before end time.`
        );
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
        joinDeadline: joinDeadline
          ? new Date(joinDeadline).toISOString()
          : null,
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
      setAgendaItems([
        { title: "", description: "", startTime: "", endTime: "" },
      ]);
    } catch (err: any) {
      console.error("Error creating event: ", err);

      if (err.response && err.response.data) {
        const errorMessage =
          err.response.data.message || "Failed to create the event.";
        setError(errorMessage);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  const handleAgendaChange = (index: number, field: string, value: string) => {
    const updatedAgendaItems = [...agendaItems];
    updatedAgendaItems[index] = {
      ...updatedAgendaItems[index],
      [field]: value,
    };
    setAgendaItems(updatedAgendaItems);
  };

  const handleAddAgendaItem = () => {
    setAgendaItems([
      ...agendaItems,
      { title: "", description: "", startTime: "", endTime: "" },
    ]);
  };

  const handleRemoveAgendaItem = (index: number) => {
    const updatedAgendaItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgendaItems);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-4">
          Create Event
        </h2>
      {successMessage && (
        <div className="text-green-500 mb-4">{successMessage}</div>
      )}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {validationErrors.length > 0 && (
        <div className="text-red-500 mb-4">
          <ul>
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Event Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event name"
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Event Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event description"
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            End Time
          </label>
          <input
            type="datetime-local"
            value={eventEndDate}
            onChange={(e) => setEventEndDate(e.target.value)}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Event Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter event location"
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Join Deadline
          </label>
          <input
            type="datetime-local"
            value={joinDeadline}
            onChange={(e) => setJoinDeadline(e.target.value)}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAttendeeLimitChecked}
            onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
            className="mr-2"
          />
          Set Attendee Limit
        </label>
        {isAttendeeLimitChecked && (
          <div className="mt-4">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Attendee Limit
            </label>
            <input
              type="number"
              value={attendeeLimit ?? ""}
              onChange={(e) => setAttendeeLimit(Number(e.target.value))}
              placeholder="Enter attendee limit"
              className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
        )}
      </div>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={joinApproval}
            onChange={(e) => setJoinApproval(e.target.checked)}
            className="mr-2"
          />
          Require Join Approval
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Agenda Items
        </label>
        {agendaItems.map((item, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              value={item.title}
              onChange={(e) =>
                handleAgendaChange(index, "title", e.target.value)
              }
              placeholder="Agenda item title"
              className="w-full p-3 mb-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) =>
                handleAgendaChange(index, "description", e.target.value)
              }
              placeholder="Agenda item description"
              className="w-full p-3 mb-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="datetime-local"
              value={item.startTime}
              onChange={(e) =>
                handleAgendaChange(index, "startTime", e.target.value)
              }
              className="w-full p-3 mb-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="datetime-local"
              value={item.endTime}
              onChange={(e) =>
                handleAgendaChange(index, "endTime", e.target.value)
              }
              className="w-full p-3 mb-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveAgendaItem(index)}
              className="text-red-500 hover:text-red-700"
            >
              Remove Agenda Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddAgendaItem}
          className="text-blue-500 hover:text-blue-700"
        >
          Add Agenda Item
        </button>
      </div>

      <button
        onClick={handleCreateEvent}
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 w-full mb-4"
      >
        {isSubmitting ? "Creating Event..." : "Create Event"}
      </button>

      <button
        onClick={handleGoBack}
        className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
      >
        Go Back
        </button>
      </div>
    </Layout>
  );
};

export default CreateEventPage;
