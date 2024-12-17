import React, { useEffect, useState } from "react";
import { fetchParticipantsByCompany } from "../services/eventOrganizerService";
import { Participant } from "../../types/eventTypes";

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
          participantId: participant.id,
          participantName: participant.fullName,
          participantEmail: participant.email,
          status: "PENDING" as "PENDING",
          joinedEventCount: participant.joinedEventCount,
          eventLinks: participant.eventLinks, // Map event links
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
    return <p>Loading participants...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>Participants from Your Company</h2>
      {participants.length === 0 ? (
        <p>No participants found for your company.</p>
      ) : (
        <ul>
          {participants.map((participant) => (
            <li key={participant.participantId}>
              {participant.participantName} - {participant.participantEmail} -
              Events Joined: {participant.joinedEventCount}
              <ul>
                {participant.eventLinks.map((link, index) => (
                  <li key={index}>
                    <a href={`/event-details/${link.split("/").pop()}`}>
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
  );
};

export default CompanyParticipantsPage;
