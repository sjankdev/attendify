import React, { useEffect, useState } from "react";
import {
  addDepartments,
  fetchDepartmentsByCompany,
} from "../services/eventOrganizerService";
import { DepartmentDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";
import axios from "axios";

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
      <div className="min-h-screen bg-[#151515] flex flex-col items-center justify-center py-8">
        <div className="max-w-3xl w-full bg-[#313030] p-6 rounded-lg shadow-lg mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Departments</h2>
          {error && (
            <p className="text-red-500 bg-red-800 p-2 rounded-md mb-4">
              {error}
            </p>
          )}

          <div className="mb-6">
            <button
              onClick={() => setIsAddingDepartments(!isAddingDepartments)}
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-500 transition duration-200"
            >
              {isAddingDepartments ? "Cancel" : "Add New Departments"}
            </button>
          </div>

          {isAddingDepartments && (
            <div className="mb-4">
              <input
                type="text"
                value={newDepartmentNames.join(",")}
                onChange={(e) =>
                  setNewDepartmentNames(e.target.value.split(","))
                }
                placeholder="Enter department names, separated by commas"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-[#313030] text-white"
              />
              <button
                onClick={handleAddDepartments}
                className="w-full mt-4 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-500 transition duration-200"
              >
                Add Departments
              </button>
            </div>
          )}

          <ul className="space-y-8">
            {departments.map((department) => (
              <li
                key={department.id}
                className="p-4 bg-[#3a3a3a] border rounded-lg hover:bg-[#4a4a4a] transition duration-300"
              >
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {department.name}
                </h3>
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">
                    Participants:
                  </h4>
                  <ul className="space-y-2">
                    {department.participants &&
                    department.participants.length > 0 ? (
                      department.participants.map((participant) => (
                        <li
                          key={participant.participantId}
                          className="flex justify-between items-center p-2 bg-[#4a4a4a] border rounded-md"
                        >
                          <span>{participant.participantName}</span>
                          <span className="text-sm text-gray-300">
                            {participant.participantEmail}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No participants</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-300 mb-2">
                    Events:
                  </h4>
                  <ul className="space-y-2">
                    {department.events && department.events.length > 0 ? (
                      department.events.map((event) => (
                        <li
                          key={event.id}
                          className="p-4 bg-[#4a4a4a] border rounded-md hover:bg-[#5a5a5a] transition duration-200"
                        >
                          <h5 className="text-xl font-semibold text-white">
                            {event.name}
                          </h5>
                          <p className="text-sm text-gray-300">
                            {event.description}
                          </p>
                          <p className="text-sm text-gray-300">
                            <strong>Location:</strong> {event.location}
                          </p>
                          <p className="text-sm text-gray-300">
                            <strong>Date:</strong>{" "}
                            {new Date(event.eventStartDate).toLocaleString()} -{" "}
                            {new Date(event.eventEndDate).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-300">
                            <strong>Organizer:</strong> {event.organizerName}
                          </p>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No events</li>
                    )}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentsList;
