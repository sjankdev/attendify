import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEventDetails } from "../services/eventOrganizerService";

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        if (!eventId) return;
        const data = await fetchEventDetails(eventId);
        setEventDetails(data);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to fetch event details");
      } finally {
        setLoading(false);
      }
    };

    loadEventDetails();
  }, [eventId]);

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h2>{eventDetails?.name}</h2>
      <p>{eventDetails?.description}</p>
      <p>
        <strong>Location:</strong> {eventDetails?.location}
      </p>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(eventDetails?.eventDate).toLocaleString()}
      </p>
      <p>
        <strong>End Date:</strong>{" "}
        {new Date(eventDetails?.eventEndDate).toLocaleString()}
      </p>
      <p>
        <strong>Attendee Limit:</strong> {eventDetails?.attendeeLimit}
      </p>

      <h3>Participants</h3>
      <ul>
        {eventDetails?.joinedParticipants.map(
          (participant: any, index: number) => (
            <li key={index}>
              {participant.participantName} ({participant.participantEmail})
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default EventDetailsPage;
