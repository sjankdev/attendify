import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AgendaItemDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";
import { validateEventForm } from "../../security/services/validation";

const CreateEventPage: React.FC = () => {
  const getBelgradeTime = () => {
    const options = { timeZone: "Europe/Belgrade", hour12: false };
    const now = new Date().toLocaleString("sv-SE", options);
    return now.replace(" ", "T");
  };

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [attendeeLimit, setAttendeeLimit] = useState<number | null>(null);
  const [isAttendeeLimitChecked, setIsAttendeeLimitChecked] =
    useState<boolean>(false);
  const [eventStartDate, setEventStartDate] = useState<string>(
    getBelgradeTime()
  );
  const [eventEndDate, setEventEndDate] = useState<string>(getBelgradeTime());
  const [joinDeadline, setJoinDeadline] = useState<string>(getBelgradeTime());
  const [joinApproval, setJoinApproval] = useState<boolean>(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItemDTO[]>([
    {
      title: "",
      description: "",
      startTime: getBelgradeTime(),
      endTime: getBelgradeTime(),
    },
  ]);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [isAllDepartments, setIsAllDepartments] = useState<boolean>(false);
  const [isAgendaVisible, setIsAgendaVisible] = useState(false);

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
        const companyId = response.data.id;
        setOrganizerId(response.data.owner.id);
        fetchDepartments(companyId);
      } catch (err) {
        console.error("Error fetching organizer details: ", err);
        setError("Failed to fetch organizer details.");
      }
    };

    const fetchDepartments = async (companyId: number) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/companies/${companyId}/departments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDepartments(response.data);
      } catch (err) {
        console.error("Error fetching departments: ", err);
        setError("Failed to fetch departments.");
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
      departmentIds: isAllDepartments ? null : selectedDepartments,
    };

    if (
      !validateEventForm(
        formData,
        setError,
        agendaItems,
        isAgendaVisible,
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
        eventStartDate: new Date(eventStartDate).toISOString(),
        eventEndDate: new Date(eventEndDate).toISOString(),
        joinDeadline: joinDeadline
          ? new Date(joinDeadline).toISOString()
          : null,
        joinApproval,
        agendaItems: isAgendaVisible
          ? agendaItems.map((item) => ({
              ...item,
              startTime: new Date(item.startTime).toISOString(),
              endTime: new Date(item.endTime).toISOString(),
            }))
          : [],
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

  const handleRemoveAgendaItem = (index: number) => {
    const updatedAgendaItems = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgendaItems);
  };

  return (
    <Layout>
      <div className="p-6 bg-[#151515] rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>

        {error && (
          <div className="text-red-500 bg-red-800 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="text-green-500 bg-green-800 p-4 rounded-lg mb-4">
            {successMessage}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-yellow-800 p-4 rounded-lg mb-4">
            <ul className="list-disc pl-5 space-y-2 text-yellow-300">
              {validationErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className=" p-5 rounded-lg ">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter event name"
              className="w-full p-3  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
          </div>

          <div className=" p-5 rounded-lg ">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event Start Date & Time
            </label>
            <input
              type="datetime-local"
              value={eventStartDate}
              onChange={(e) => setEventStartDate(e.target.value)}
              className="w-full p-3  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
          </div>

          <div className=" p-5 rounded-lg ">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event End Date & Time
            </label>
            <input
              type="datetime-local"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              className="w-full p-3  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
          </div>

          <div className=" p-5 rounded-lg ">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter event location"
              className="w-full p-3  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
          </div>

          <div className=" p-5 rounded-lg ">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Registration Deadline
            </label>
            <input
              type="datetime-local"
              value={joinDeadline}
              onChange={(e) => setJoinDeadline(e.target.value)}
              className="w-full p-3  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
          </div>

          <div className=" p-5 rounded-lg  col-span-1 sm:col-span-2 md:col-span-3">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Event Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
              rows={4}
              className="w-full p-3  rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
          </div>

          <div className="p-5 rounded-lg col-span-1 sm:col-span-2 md:col-span-3 flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={joinApproval}
                onChange={(e) => setJoinApproval(e.target.checked)}
                className="h-5 w-5 border-gray-600 rounded transition duration-200 transform scale-110 hover:scale-125 focus:ring-2 focus:ring-teal-500 text-teal-500"
              />
              <label className="text-sm font-semibold text-gray-300">
                Require Join Approval
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isAttendeeLimitChecked}
                onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
                className="h-5 w-5 border-gray-600 rounded transition duration-200 transform scale-110 hover:scale-125 focus:ring-2 focus:ring-teal-500 text-teal-500"
              />
              <label className="text-sm font-semibold text-gray-300">
                Set Attendee Limit
              </label>
              {isAttendeeLimitChecked && (
                <div className="mt-2">
                  <input
                    type="number"
                    value={attendeeLimit ?? ""}
                    onChange={(e) => setAttendeeLimit(Number(e.target.value))}
                    placeholder="Limit"
                    min="1"
                    className="w-28 p-2 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white placeholder-gray-400"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-5 rounded-lg col-span-1 sm:col-span-2 md:col-span-3 flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isAllDepartments}
              onChange={() => setIsAllDepartments(!isAllDepartments)}
              className="h-5 w-5 border-gray-600 rounded transition duration-200 transform scale-110 hover:scale-125 focus:ring-2 focus:ring-teal-500 text-teal-500"
            />
            <label className="text-sm font-semibold text-gray-300">
              Event Open to All Departments
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[35%_65%] gap-6 col-span-1 sm:col-span-2 md:col-span-3">
            {!isAllDepartments && (
              <div className="p-5 rounded-lg">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Select Departments
                </label>
                <select
                  multiple
                  value={selectedDepartments.map(String)}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => parseInt(option.value)
                    );
                    setSelectedDepartments(selected);
                  }}
                  className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
                >
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="p-5 rounded-lg">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Agenda Items for the Event
              </label>
              {isAgendaVisible && (
                <div className="p-5 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Agenda Items for the Event
                  </label>
                  {agendaItems.map((item, index) => (
                    <div key={index} className="space-y-4 mb-4">
                      <div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) =>
                            handleAgendaChange(index, "title", e.target.value)
                          }
                          placeholder="Agenda item title"
                          className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleAgendaChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Agenda item description"
                          className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="datetime-local"
                          value={item.startTime}
                          onChange={(e) =>
                            handleAgendaChange(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="datetime-local"
                          value={item.endTime}
                          onChange={(e) =>
                            handleAgendaChange(index, "endTime", e.target.value)
                          }
                          className="w-full p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAgendaItem(index)}
                          className="text-red-400 hover:underline"
                        >
                          Remove Agenda Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setIsAgendaVisible(!isAgendaVisible)}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-500"
              >
                Add New Agenda Item
              </button>
            </div>
          </div>

          <div className="flex justify-start space-x-4 col-span-1 sm:col-span-2 md:col-span-3">
            <button
              onClick={handleCreateEvent}
              disabled={isSubmitting}
              className="bg-[#F6F6F7] text-[#151515] px-6 py-2 rounded-lg hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Create Event"}
            </button>

            <button
              onClick={handleGoBack}
              className="bg-red-100 text-red-700 px-6 py-2 rounded-lg hover:bg-red-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateEventPage;
