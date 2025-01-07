import React, { useEffect, useState } from "react";
import { fetchParticipantsByCompany } from "../services/eventOrganizerService";
import { Participant } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";

const CompanyParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadParticipants = async () => {
      try {
        console.log("Fetching participants...");
        const data = await fetchParticipantsByCompany();
        console.log("Fetched participants:", data);

        const mappedParticipants = data.map((participant: any) => ({
          participantId: participant.participantId,
          participantName: participant.participantName,
          participantEmail: participant.participantEmail,
          departmentName: participant.departmentName,
          status: "PENDING" as "PENDING",
          joinedEventCount: participant.joinedEventCount,
          eventLinks: participant.eventLinks,
        }));

        setParticipants(mappedParticipants);
      } catch (err) {
        console.error("Error while fetching participants:", err);
        setError("Failed to fetch participants");
      } finally {
        setLoading(false);
      }
    };

    loadParticipants();
  }, []);

  if (loading) {
    return <div className="text-center text-lg">Loading participants...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <Layout>
      <div className="p-6 bg-[#151515] rounded-lg shadow-lg max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">
          Participants from Your Company
        </h2>
        {participants.length === 0 ? (
          <p className="text-center text-lg text-yellow-300">
            No participants found for your company.
          </p>
        ) : (
          <ul className="space-y-4">
            {participants.map((participant) => (
              <li
                key={participant.participantId}
                className="bg-[#313030] p-4 rounded-lg shadow-sm hover:bg-[#3a3a3a] transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-medium text-white">
                      {participant.participantName}
                    </h3>
                    <p className="text-gray-300">
                      {participant.participantEmail}
                    </p>
                    <p className="text-sm text-gray-400">
                      Department: {participant.departmentName}
                    </p>
                    <p className="text-sm text-gray-400">
                      Events Joined: {participant.joinedEventCount}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {participant.eventLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={`/event-details/${link.split("/").pop()}`}
                        className="text-teal-500 hover:underline"
                      >
                        Event {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Layout>
  );
};

export default CompanyParticipantsPage;
