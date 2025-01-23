import React, { useEffect, useState } from "react";
import {
  addDepartments,
  fetchDepartmentsByCompany,
} from "../services/eventOrganizerService";
import { DepartmentDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/EventOrganizerLayout";
import axios from "axios";
import { FaUsers, FaCalendarAlt, FaPlusCircle } from "react-icons/fa";

const DepartmentsList: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [newDepartmentNames, setNewDepartmentNames] = useState<string[]>([]);
  const [isAddingDepartments, setIsAddingDepartments] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<{
    departmentId: number | null;
    eventId: number | null;
  }>({ departmentId: null, eventId: null });
  const [showMoreEvents, setShowMoreEvents] = useState<{
    [departmentId: number]: boolean;
  }>({});

  const toggleEventDetails = (departmentId: number, eventId: number) => {
    setExpandedEvent((prev) =>
      prev.departmentId === departmentId && prev.eventId === eventId
        ? { departmentId: null, eventId: null }
        : { departmentId, eventId }
    );
  };

  const handleMoreEventsClick = (departmentId: number) => {
    setShowMoreEvents((prev) => ({
      ...prev,
      [departmentId]: !prev[departmentId],
    }));
  };

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const departments = await fetchDepartmentsByCompany();
        setDepartments(departments);
      } catch (error) {
        setError("Error fetching departments");
      }
    };

    getDepartments();
  }, []);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const companyResponse = await axios.get(
          "https://attendify-backend-el2r.onrender.com/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCompanyId(companyResponse.data.id);
        console.log("Company ID:", companyResponse.data.id);
      } catch (err: any) {
        console.error("Error fetching company information: ", err);
        setError("Failed to fetch company information.");
      }
    };

    fetchCompanyId();
  }, []);

  const handleAddDepartments = async () => {
    if (companyId && newDepartmentNames.length > 0) {
      try {
        await addDepartments(newDepartmentNames, companyId);

        setNewDepartmentNames([]);
        setIsAddingDepartments(false);

        const updatedDepartments = await fetchDepartmentsByCompany();
        setDepartments(updatedDepartments);
      } catch (error) {
        setError("Failed to add departments.");
      }
    }
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-6">Company Departments</h2>
        <button
          onClick={() => setIsAddingDepartments(!isAddingDepartments)}
          className="flex items-center px-6 py-3 bg-[#6167E0] text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500"
        >
          {isAddingDepartments ? "Add New Department" : "Add New Department"}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {isAddingDepartments && (
        <div className="space-y-4 mt-6">
          <input
            type="text"
            value={newDepartmentNames.join(",")}
            onChange={(e) => setNewDepartmentNames(e.target.value.split(","))}
            placeholder="Enter department names, separated by commas"
            className="w-full p-3 border border-[#BA10AA] rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 bg-[#11011E] text-white"
          />
          <div className="flex space-x-4">
            <button
              onClick={handleAddDepartments}
              className="px-6 py-3 bg-[#BA10AA] text-white rounded-lg transition-colors focus:ring-2 focus:ring-green-500"
            >
              Add Departments
            </button>
            <button
              onClick={() => setIsAddingDepartments(false)}
              className="px-6 py-3 bg-gray-500  text-white rounded-lg transition-colors focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8">
        {departments.map((department) => (
          <div
            key={department.id}
            className="bg-[#11011E] text-white p-6 rounded-lg shadow-md space-y-4"
          >
            <h3 className="text-2xl font-semibold">{department.name}</h3>

            <div>
              <h4 className="text-xl font-medium flex items-center space-x-2">
                <FaUsers />
                <span>Participants:</span>
              </h4>
              {department.participants && department.participants.length > 0 ? (
                <>
                  <ul className="space-y-2 mt-4">
                    {department.participants.slice(0, 5).map((participant) => (
                      <li
                        key={participant.participantId}
                        className="border-b pb-2 text-gray-300"
                      >
                        <div>{participant.participantName}</div>
                      </li>
                    ))}
                  </ul>
                  {department.participants.length > 5 && (
                    <button className="text-blue-500 mt-4">
                      More Participants
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No participants</p>
              )}
            </div>

            <div>
              <h4 className="text-xl font-medium flex items-center space-x-2">
                <FaCalendarAlt />
                <span>Events</span>
              </h4>
              {department.events && department.events.length > 0 ? (
                <>
                  <ul className="space-y-4 mt-4">
                    {department.events
                      .slice(
                        0,
                        showMoreEvents[department.id]
                          ? department.events.length
                          : 5
                      )
                      .map((event) => (
                        <li key={event.id} className="border-b pb-4">
                          <div className="flex justify-between items-center">
                            <h5 className="text-xl font-semibold">
                              {event.name}
                            </h5>
                          </div>
                          <div className="text-center mt-2">
                            <button
                              onClick={() =>
                                toggleEventDetails(department.id, event.id)
                              }
                              className="text-blue-400 hover:text-blue-700"
                            >
                              {expandedEvent.departmentId === department.id &&
                              expandedEvent.eventId === event.id
                                ? "See Less"
                                : "See More"}
                            </button>
                          </div>
                          {expandedEvent.departmentId === department.id &&
                            expandedEvent.eventId === event.id && (
                              <div className="mt-4 space-y-2 text-gray-300">
                                <p>{event.description}</p>
                                <p>
                                  <strong>Location:</strong> {event.location}
                                </p>
                                <p>
                                  <strong>Date:</strong>{" "}
                                  {new Date(
                                    event.eventStartDate
                                  ).toLocaleString()}{" "}
                                  -{" "}
                                  {new Date(
                                    event.eventEndDate
                                  ).toLocaleString()}
                                </p>
                                <p>
                                  <strong>Organizer:</strong>{" "}
                                  {event.organizerName}
                                </p>
                              </div>
                            )}
                        </li>
                      ))}
                  </ul>
                  {department.events.length > 5 && (
                    <button
                      className="text-blue-500 mt-4"
                      onClick={() => handleMoreEventsClick(department.id)}
                    >
                      {showMoreEvents[department.id]
                        ? "Show Less"
                        : "More Events"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500">No events</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default DepartmentsList;
