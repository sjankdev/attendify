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
  const [companyName, setCompanyName] = useState<string>("");
  const [newDepartmentNames, setNewDepartmentNames] = useState<string[]>([]);
  const [isAddingDepartments, setIsAddingDepartments] = useState(false);

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
    const fetchCompanyData = async () => {
      try {
        const companyResponse = await axios.get(
          "http://localhost:8080/api/auth/company",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCompanyId(companyResponse.data.id);
        setCompanyName(companyResponse.data.name);

        const departmentResponse = await axios.get(
          `http://localhost:8080/api/companies/${companyResponse.data.id}/departments`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setDepartments(departmentResponse.data);
      } catch (err: any) {
        console.error(
          "Error fetching company or department information: ",
          err
        );
        setError("Failed to fetch company or department information.");
      }
    };

    fetchCompanyData();
  }, []);

  const handleAddDepartments = async () => {
    if (companyId && newDepartmentNames.length > 0) {
      try {
        await addDepartments(newDepartmentNames, companyId);
        setNewDepartmentNames([]);
        setIsAddingDepartments(false);
      } catch (error) {
        setError("Failed to add departments.");
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-8 bg-[#101010] rounded-lg shadow-xl space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-4xl font-semibold text-white">Departments</h2>
          <button
            onClick={() => setIsAddingDepartments(!isAddingDepartments)}
            className="px-6 py-2 bg-teal-600 text-white text-lg font-semibold rounded-md hover:bg-teal-500 transition-all"
          >
            <FaPlusCircle className="inline mr-2" />
            {isAddingDepartments ? "Cancel" : "Add New Department"}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-800 text-red-400 rounded-lg shadow-md">
            {error}
          </div>
        )}

        {isAddingDepartments && (
          <div className="space-y-4 mt-6">
            <input
              type="text"
              value={newDepartmentNames.join(",")}
              onChange={(e) => setNewDepartmentNames(e.target.value.split(","))}
              placeholder="Enter department names, separated by commas"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
            />
            <button
              onClick={handleAddDepartments}
              className="w-full px-6 py-3 bg-teal-600 text-white text-lg font-semibold rounded-md hover:bg-teal-500 transition-all"
            >
              Add Departments
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map((department) => (
            <div
              key={department.id}
              className="p-6 bg-[#313030] rounded-lg shadow-md space-y-6 hover:shadow-xl hover:bg-[#424242] transition-all"
            >
              <h3 className="text-3xl font-semibold text-white">
                {department.name}
              </h3>

              <div>
                <h4 className="text-xl font-semibold text-gray-300 mb-3 flex items-center">
                  <FaUsers className="inline mr-2" />
                  Participants:
                </h4>
                {department.participants &&
                department.participants.length > 0 ? (
                  <ul className="space-y-3">
                    {department.participants.map((participant) => (
                      <li
                        key={participant.participantId}
                        className="p-4 bg-[#4a4a4a] border rounded-md hover:bg-[#5a5a5a] transition-all"
                      >
                        <div className="text-white">
                          {participant.participantName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {participant.participantEmail}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No participants</p>
                )}
              </div>

              <div>
                <h4 className="text-xl font-semibold text-gray-300 mb-3 flex items-center">
                  <FaCalendarAlt className="inline mr-2" />
                  Events:
                </h4>
                {department.events && department.events.length > 0 ? (
                  <ul className="space-y-3">
                    {department.events.map((event) => (
                      <li
                        key={event.id}
                        className="p-4 bg-[#4a4a4a] border rounded-md hover:bg-[#5a5a5a] transition-all"
                      >
                        <h5 className="text-2xl font-semibold text-white">
                          {event.name}
                        </h5>
                        <p className="text-sm text-gray-400">
                          {event.description}
                        </p>
                        <p className="text-sm text-gray-400">
                          <strong>Location:</strong> {event.location}
                        </p>
                        <p className="text-sm text-gray-400">
                          <strong>Date:</strong>{" "}
                          {new Date(event.eventStartDate).toLocaleString()} -{" "}
                          {new Date(event.eventEndDate).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-400">
                          <strong>Organizer:</strong> {event.organizerName}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No events</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentsList;
