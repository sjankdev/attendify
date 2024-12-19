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
        "http:/localhost:8080/api/auth/event-organizer/create-event",
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

      if (err.response && err.response.data) {
        const errorMessage = err.response.data.message || "Failed to create the event.";
        setError(errorMessage);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
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
    setAgendaItems([
      ...agendaItems,
      { title: "", description: "", startTime: "", endTime: "" },
    ]);
  };

  const removeAgendaItem = (index: number) => {
    const updatedAgendaItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgendaItems);
  };

  const handleGoBack = () => {
    navigate("/event-organizer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create Event</h2>

        {successMessage && (
          <div className="text-green-500 mb-4 text-center">{successMessage}</div>
        )}
        {error && (
          <div className="text-red-500 mb-4 text-center">{error}</div>
        )}
        {validationErrors.length > 0 && (
          <div className="text-red-500 mb-4">
            <ul>
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Event Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-32"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Event Date</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Event End Date</label>
            <input
              type="datetime-local"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg font-medium text-gray-700">Join Deadline</label>
            <input
              type="datetime-local"
              value={joinDeadline}
              onChange={(e) => setJoinDeadline(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={isAttendeeLimitChecked}
              onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg text-gray-700">Set Attendee Limit</label>
            {isAttendeeLimitChecked && (
              <div className="mt-4">
                <label className="block text-lg font-medium text-gray-700">Attendee Limit</label>
                <input
                  type="number"
                  value={attendeeLimit ?? ""}
                  onChange={(e) => setAttendeeLimit(Number(e.target.value))}
                  placeholder="Enter attendee limit"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
          </div>

          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              checked={joinApproval}
              onChange={(e) => setJoinApproval(e.target.checked)}
              className="mr-2"
            />
            <label className="text-lg text-gray-700">Require Join Approval</label>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Agenda Items</h3>
            {agendaItems.map((item, index) => (
              <div key={index} className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Agenda Item {index + 1}</h4>
                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleAgendaItemChange(index, "title", e.target.value)}
                    placeholder="Enter agenda title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleAgendaItemChange(index, "description", e.target.value)}
                    placeholder="Enter agenda description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 h-24"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={item.startTime}
                    onChange={(e) => handleAgendaItemChange(index, "startTime", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-lg font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={item.endTime}
                    onChange={(e) => handleAgendaItemChange(index, "endTime", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeAgendaItem(index)}
                  className="bg-red-600 text-white py-2 px-4 rounded-lg mt-2 w-full hover:bg-red-700 transition duration-300"
                >
                  Remove Agenda Item
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addAgendaItem}
              className="bg-green-600 text-white py-2 px-4 rounded-lg mt-2 w-full hover:bg-green-700 transition duration-300"
            >
              Add Agenda Item
            </button>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={handleGoBack}
              className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Go Back
            </button>
            <button
              onClick={handleCreateEvent}
              disabled={isSubmitting}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
