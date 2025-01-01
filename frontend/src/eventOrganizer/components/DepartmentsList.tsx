import React, { useEffect, useState } from "react";
import { fetchDepartmentsByCompany } from "../services/eventOrganizerService";
import { DepartmentDTO } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";

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
    <Layout>
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-8">
      <div className="max-w-4xl w-full bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Departments</h2>
        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded-md mb-4">{error}</p>
        )}
        <ul className="space-y-8">
          {departments.map((department) => (
            <li
              key={department.id}
              className="p-4 bg-gray-50 border rounded-lg hover:bg-gray-200 transition duration-300"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {department.name}
              </h3>
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Participants:
                </h4>
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
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Events:
                </h4>
                <ul className="space-y-2">
                  {department.events.length > 0 ? (
                    department.events.map((event) => (
                      <li
                        key={event.id}
                        className="p-4 bg-gray-100 border rounded-md hover:bg-gray-300 transition duration-200"
                      >
                        <h5 className="text-xl font-semibold text-gray-800">
                          {event.name}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {event.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {event.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Date:</strong>{" "}
                          {new Date(event.eventStartDate).toLocaleString()} -{" "}
                          {new Date(event.eventEndDate).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Organizer:</strong> {event.organizerName}
                        </p>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">No events</li>
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
