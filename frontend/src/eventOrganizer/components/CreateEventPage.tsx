import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AgendaItemDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";
import { validateEventForm } from "../../security/services/validation";

const CreateEventPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [attendeeLimit, setAttendeeLimit] = useState<number | null>(null);
  const [isAttendeeLimitChecked, setIsAttendeeLimitChecked] =
    useState<boolean>(false);
  const [eventStartDate, setEventStartDate] = useState<string>("");
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

  const handleCreateEvent = async () => {
    setSuccessMessage(null);
    setError(null);

    const formData = {
      name,
      description,
      location,
      organizerId,
      attendeeLimit: isAttendeeLimitChecked ? attendeeLimit : null,
      eventStartDate,
      eventEndDate,
      joinDeadline,
    };

    if (
      !validateEventForm(
        formData,
        setError,
        agendaItems,
        isAttendeeLimitChecked,
        attendeeLimit,
        eventStartDate,
        eventEndDate,
        joinDeadline
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      const eventData = {
        ...formData,
        eventDate: new Date(eventStartDate).toISOString(),
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Create Event
        </h2>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
            {successMessage}
          </div>
        )}
        {validationErrors.length > 0 && (
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mb-4">
            <ul>
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 border border-gray-300 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={eventStartDate}
              onChange={(e) => setEventStartDate(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={4}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="datetime-local"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Join Deadline
            </label>
            <input
              type="datetime-local"
              value={joinDeadline}
              onChange={(e) => setJoinDeadline(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={isAttendeeLimitChecked}
                onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
                className="mr-2"
              />
              Set Attendee Limit
            </label>
            {isAttendeeLimitChecked && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Attendee Limit
                </label>
                <input
                  type="number"
                  value={attendeeLimit ?? ""}
                  onChange={(e) => setAttendeeLimit(Number(e.target.value))}
                  placeholder="Enter attendee limit"
                  min="1"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={joinApproval}
                onChange={(e) => setJoinApproval(e.target.checked)}
                className="mr-2"
              />
              Require Join Approval
            </label>
          </div>
        </div>

        <div className="p-6 border border-gray-300 rounded-lg shadow-sm mb-6">
          <label className="block text-sm font-medium text-gray-700">
            Agenda Items
          </label>
          {agendaItems.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
            >
              <div>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    handleAgendaChange(index, "title", e.target.value)
                  }
                  placeholder="Agenda item title"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleAgendaChange(index, "description", e.target.value)
                  }
                  placeholder="Agenda item description"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="datetime-local"
                  value={item.startTime}
                  onChange={(e) =>
                    handleAgendaChange(index, "startTime", e.target.value)
                  }
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <input
                  type="datetime-local"
                  value={item.endTime}
                  onChange={(e) =>
                    handleAgendaChange(index, "endTime", e.target.value)
                  }
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2 flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => handleRemoveAgendaItem(index)}
                  className="text-red-500 font-semibold hover:text-red-700"
                >
                  Remove Agenda Item
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddAgendaItem}
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Add Agenda Item
          </button>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleCreateEvent}
            disabled={isSubmitting}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Event..." : "Create Event"}
          </button>
          <button
            onClick={handleGoBack}
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEventPage;
