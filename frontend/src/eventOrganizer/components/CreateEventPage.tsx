import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AgendaItemDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/EventOrganizerLayout";
import { validateEventForm } from "../../security/services/validation";

const CreateEventPage: React.FC = () => {
  const getBelgradeTime = (date: string | Date): string => {
    const options = { timeZone: "Europe/Belgrade", hour12: false };
    return new Date(
      new Date(date).toLocaleString("sv-SE", options)
    ).toISOString();
  };

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [organizerId, setOrganizerId] = useState<number | null>(null);
  const [attendeeLimit, setAttendeeLimit] = useState<number | null>(null);
  const [isAttendeeLimitChecked, setIsAttendeeLimitChecked] =
    useState<boolean>(false);
  const [eventStartDate, setEventStartDate] = useState<string>(
    getBelgradeTime(new Date())
  );
  const [eventEndDate, setEventEndDate] = useState<string>(
    getBelgradeTime(new Date())
  );
  const [joinDeadline, setJoinDeadline] = useState<string>(
    getBelgradeTime(new Date())
  );

  const [joinApproval, setJoinApproval] = useState<boolean>(false);
  const [agendaItems, setAgendaItems] = useState([
    {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
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
          "https://attendify-backend-el2r.onrender.com/api/auth/company",
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
          `https://attendify-backend-el2r.onrender.com/api/companies/${companyId}/departments`,
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
      const updatedAgendaItems = isAgendaVisible
        ? agendaItems.map((item) => ({
            ...item,
            startTime: getBelgradeTime(item.startTime),
            endTime: getBelgradeTime(item.endTime),
          }))
        : [];

      const eventData = {
        ...formData,
        eventStartDate: getBelgradeTime(eventStartDate),
        eventEndDate: getBelgradeTime(eventEndDate),
        joinDeadline: joinDeadline ? getBelgradeTime(joinDeadline) : null,
        joinApproval,
        agendaItems: updatedAgendaItems,
      };

      await axios.post(
        "https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/create-event",
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

  const handleAddAgendaItem = () => {
    setAgendaItems([
      ...agendaItems,
      {
        title: "",
        description: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  return (
    <Layout
      className="text-white"
      style={{
        backgroundImage: `url('/assets/organizer-homepage/home-bg-1.jpg')`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <h2 className="text-2xl font-bold mb-6">Create New Event</h2>

      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
      )}

      {successMessage && (
        <div className="bg-green-500 text-white p-2 rounded mb-4">
          {successMessage}
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="bg-yellow-500 text-white p-2 rounded mb-4">
          <ul className="list-disc list-inside">
            {validationErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Event Name</label>
          <input
            type="text"
            className="w-full px-3 py-2 text-white rounded border border-[#BA10AA] bg-[#11011E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter event name"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Event Start Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 text-white rounded border border-[#BA10AA] bg-[#11011E] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={eventStartDate}
              onChange={(e) => setEventStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Event End Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2  text-white rounded border border-[#BA10AA] bg-[#11011E] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Registration Deadline
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2  text-white rounded border border-[#BA10AA] bg-[#11011E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={joinDeadline}
            onChange={(e) => setJoinDeadline(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            className="w-full px-3 py-2  text-white rounded border border-[#BA10AA] bg-[#11011E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter event location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Event Description
          </label>
          <textarea
            className="w-full px-3 py-2  text-white rounded border border-[#BA10AA] bg-[#11011E] focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event description"
            rows={4}
          ></textarea>
        </div>

        <div className="flex items-center space-x-6">
          <label
            htmlFor="joinApproval"
            className={`flex text-white items-center px-4 py-2 rounded border ${
              joinApproval
                ? "bg-[#BA10AA] border border-[#BA10AA] text-white"
                : "bg-[#11011E] text-gray-800"
            } cursor-pointer transition-colors duration-300`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={joinApproval}
              onChange={(e) => setJoinApproval(e.target.checked)}
              id="joinApproval"
            />
            Join with Organizer Approval
          </label>

          <label
            htmlFor="attendeeLimitCheck"
            className={`flex text-white items-center px-4 py-2 rounded border ${
              isAttendeeLimitChecked
                ? "bg-[#BA10AA] border border-[#BA10AA] text-white"
                : "bg-[#11011E] text-gray-800"
            } cursor-pointer transition-colors duration-300`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={isAttendeeLimitChecked}
              onChange={(e) => setIsAttendeeLimitChecked(e.target.checked)}
              id="attendeeLimitCheck"
            />
            Set Attendee Limit
          </label>
          {isAttendeeLimitChecked && (
            <input
              type="number"
              className="w-24 px-2 py-1 bg-[#11011E] text-white rounded border border-[#BA10AA] focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={attendeeLimit ?? ""}
              onChange={(e) => setAttendeeLimit(Number(e.target.value))}
              placeholder="Limit"
              min="1"
              id="attendeeLimit"
            />
          )}
        </div>

        <div>
          <div>
            <div className="flex items-center space-x-3">
              <label
                htmlFor="allDepartments"
                className={`flex items-center px-4 py-2 rounded border cursor-pointer transition-colors duration-300 ${
                  isAllDepartments
                    ? "bg-[#BA10AA] border-[#BA10AA] text-white"
                    : "bg-[#11011E] text-gray-800 border"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isAllDepartments}
                  onChange={() => setIsAllDepartments(!isAllDepartments)}
                  id="allDepartments"
                />
                <span className="mr-2 text-white">
                  Event Open to All Departments
                </span>
              </label>
            </div>
          </div>

          {!isAllDepartments && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Select Departments
              </label>
              <select
                multiple
                className="w-full px-3 py-2 bg-[#11011E] text-white rounded border border-[#BA10AA] focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDepartments.map(String)}
                onChange={(e) => {
                  const selected = Array.from(
                    e.target.selectedOptions,
                    (option) => parseInt(option.value)
                  );
                  setSelectedDepartments(selected);
                }}
              >
                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                    style={{
                      backgroundColor: selectedDepartments.includes(
                        department.id
                      )
                        ? "#BA10AA"
                        : "#11011E",
                      color: selectedDepartments.includes(department.id)
                        ? "#FFFFFF"
                        : "#FFFFFF",
                    }}
                  >
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="p-5 bg-[#11011E] rounded-lg shadow-lg">
          <label className="block text-sm font-semibold text-gray-300 mb-4">
            Agenda Items for the Event
          </label>
          {isAgendaVisible ? (
            <div>
              {agendaItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-[#340151] rounded-lg shadow-md mb-4 border border-gray-700"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-gray-200">
                      Agenda Item {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveAgendaItem(index)}
                      className="text-red-400 hover:text-red-500 focus:outline-none"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleAgendaChange(index, "title", e.target.value)
                      }
                      placeholder="Title"
                      className="w-full px-3 py-2 bg-[#11011E] text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        handleAgendaChange(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-[#11011E] text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="datetime-local"
                        value={item.startTime}
                        onChange={(e) =>
                          handleAgendaChange(index, "startTime", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[#11011E] text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="datetime-local"
                        value={item.endTime}
                        onChange={(e) =>
                          handleAgendaChange(index, "endTime", e.target.value)
                        }
                        className="w-full px-3 py-2 bg-[#11011E] text-white rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddAgendaItem();
                }}
                className="bg-[#6167E0] text-white px-6 py-2 rounded-lg "
              >
                Add New Agenda Item
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAgendaVisible(true)}
              className="bg-[#6167E0] text-white px-6 py-2 rounded-lg  focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Add New Agenda Item
            </button>
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            className="w-auto px-6 py-2 bg-[#BA10AA] text-white font-bold rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            onClick={handleCreateEvent}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Create Event"}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CreateEventPage;
