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
    return <div className="text-center text-lg text-gray-500">Loading event details...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold text-gray-800 mb-4">{eventDetails?.name}</h2>
      <p className="text-gray-700 mb-6">{eventDetails?.description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="flex flex-col space-y-2">
          <p className="text-lg text-gray-800">
            <strong className="font-semibold">Location:</strong> {eventDetails?.location}
          </p>
          <p className="text-lg text-gray-800">
            <strong className="font-semibold">Date:</strong>{" "}
            {new Date(eventDetails?.eventDate).toLocaleString()}
          </p>
          <p className="text-lg text-gray-800">
            <strong className="font-semibold">End Date:</strong>{" "}
            {new Date(eventDetails?.eventEndDate).toLocaleString()}
          </p>
          <p className="text-lg text-gray-800">
            <strong className="font-semibold">Attendee Limit:</strong> {eventDetails?.attendeeLimit}
          </p>
        </div>
        <div className="flex flex-col space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">Participants</h3>
          {eventDetails?.joinedParticipants.length === 0 ? (
            <p className="text-gray-500">No participants yet</p>
          ) : (
            <ul className="space-y-2">
              {eventDetails?.joinedParticipants.map((participant: any, index: number) => (
                <li key={index} className="text-gray-700">
                  {participant.participantName}{" "}
                  <span className="text-sm text-gray-500">({participant.participantEmail})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
