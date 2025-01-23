import React, { useEffect, useState } from "react";
import { fetchParticipantsByCompany } from "../services/eventOrganizerService";
import { Participant } from "../../types/eventTypes";
import Layout from "../../shared/components/EventOrganizerLayout";
import { Link, useNavigate } from "react-router-dom";
import { FaUsers, FaUserCheck } from "react-icons/fa";

interface ExtendedParticipant extends Participant {
  showAllEvents: boolean;
}

const CompanyParticipantsPage: React.FC = () => {
  const [participants, setParticipants] = useState<ExtendedParticipant[]>([]);
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
          showAllEvents: false,
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

  const toggleShowMoreEvents = (participantId: number) => {
    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) =>
        participant.participantId === participantId
          ? { ...participant, showAllEvents: !participant.showAllEvents }
          : participant
      )
    );
  };

  if (loading) {
    return <div className="text-center text-lg">Loading participants...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

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
      <div className="p-8 bg-[#101010] rounded-lg shadow-xl max-w-5xl mx-auto relative">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Company Participants Dashboard
        </h2>

        <p className="text-lg text-gray-300 mb-6">
          Here you can view and manage participants, track their engagement, and
          see the events they have joined.
        </p>
        <div className="absolute top-6 right-6">
          <button
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500"
            onClick={() => navigate("/event-organizer/invitations")}
          >
            Invite More Participants
          </button>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4">Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
            <div className="p-6 bg-blue-800 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              {" "}
              <div className="flex items-center space-x-4">
                <FaUsers className="text-teal-500 text-3xl" />
                <div>
                  <h4 className="text-xl font-medium">Total Participants</h4>
                  <p className="text-2xl font-semibold">
                    {participants.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-green-800 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              {" "}
              <div className="flex items-center space-x-4">
                <FaUserCheck className="text-teal-500 text-3xl" />
                <div>
                  <h4 className="text-xl font-medium">Active Participants</h4>
                  <p className="text-2xl font-semibold">
                    {participants.filter((p) => p.joinedEventCount > 0).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {participants.length === 0 ? (
          <p className="text-center text-lg text-yellow-300">
            No participants found for your company.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {participants.map((participant) => (
                <div
                  key={participant.participantId}
                  className="bg-[#2A2A2A] p-6 rounded-lg shadow-md hover:bg-[#333333] hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {participant.participantName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Department: {participant.departmentName}
                      </p>
                      <p className="text-sm text-gray-400">
                        Events Joined: {participant.joinedEventCount}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2">
                    {participant.eventLinks.slice(0, 3).map((link, index) => (
                      <li key={index}>
                        <Link
                          to={`/event-details/${link.split("/").pop()}`}
                          className="text-teal-500 hover:underline"
                        >
                          Event {index + 1}
                        </Link>
                      </li>
                    ))}
                    {participant.joinedEventCount > 3 &&
                      participant.showAllEvents && (
                        <>
                          {participant.eventLinks
                            .slice(3)
                            .map((link, index) => (
                              <li key={index + 3}>
                                <Link
                                  to={`/event-details/${link.split("/").pop()}`}
                                  className="text-teal-500 hover:underline"
                                >
                                  Event {index + 4}
                                </Link>
                              </li>
                            ))}
                        </>
                      )}
                    {participant.joinedEventCount > 3 && (
                      <li>
                        <button
                          onClick={() =>
                            toggleShowMoreEvents(participant.participantId)
                          }
                          className="text-teal-500 hover:underline"
                        >
                          {participant.showAllEvents
                            ? "Show Less"
                            : "See More Events"}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompanyParticipantsPage;
