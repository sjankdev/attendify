import React, { useEffect, useState } from "react";
import { fetchParticipantsByCompany } from "../services/eventOrganizerService";
import { Participant } from "../../types/eventTypes";
import Layout from "../../shared/components/Layout";
import { useNavigate } from "react-router-dom";

const CompanyParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

        <p className="text-lg text-gray-300 mb-6">
          Welcome to the company participants dashboard. Here you can view and
          manage participants who have joined events hosted by your company. You
          can also track their participation and engagement levels.
        </p>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white">Overview</h3>
          <div className="grid grid-cols-3 gap-4 text-gray-300">
            <div className="p-4 bg-[#313030] rounded-lg shadow-sm">
              <h4 className="text-lg font-medium">Total Participants</h4>
              <p className="text-2xl font-bold">{participants.length}</p>
            </div>
            <div className="p-4 bg-[#313030] rounded-lg shadow-sm">
              <h4 className="text-lg font-medium">Active Participants</h4>
              <p className="text-2xl font-bold">
                {participants.filter((p) => p.joinedEventCount > 0).length}
              </p>
            </div>
            <div className="p-4 bg-[#313030] rounded-lg shadow-sm">
              <h4 className="text-lg font-medium">Total Events</h4>
              <p className="text-2xl font-bold">
                {participants.reduce(
                  (acc, participant) => acc + participant.joinedEventCount,
                  0
                )}
              </p>
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <p className="text-center text-lg text-yellow-300">
            No participants found for your company.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {participants.map((participant) => (
              <div
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
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            className="bg-teal-500 text-white py-2 px-6 rounded-full hover:bg-teal-600 transition-all"
            onClick={() => navigate("/event-organizer/invitations")}
          >
            Invite More Participants
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyParticipantsPage;
