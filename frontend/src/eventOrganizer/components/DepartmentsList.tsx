import React, { useEffect, useState } from "react";
import { fetchDepartmentsByCompany } from "../services/eventOrganizerService";
import { DepartmentDTO, Participant } from "../../types/eventTypes";

const DepartmentsList: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8">
      <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Departments</h2>
        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded-md mb-4">{error}</p>
        )}
        <ul className="space-y-4">
          {departments.map((department) => (
            <li
              key={department.id}
              className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg hover:bg-gray-200 transition duration-300"
            >
              <span className="text-xl font-semibold text-gray-800">
                {department.name}
              </span>
              <ul className="space-y-2">
                {department.participants.length > 0 ? (
                  department.participants.map((participant) => (
                    <li
                      key={participant.participantId}
                      className="flex justify-between items-center p-2 bg-gray-100 border rounded-md"
                    >
                      <span>{participant.participantName}</span>
                      <span className="text-sm text-gray-600">
                        {participant.participantEmail}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">No participants</li>
                )}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DepartmentsList;
