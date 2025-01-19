import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEventDetailsWithParticipants } from "../services/eventOrganizerService";
import Layout from "../../shared/components/EventOrganizerLayout";
import { Event } from "../../types/eventTypes";

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetails, setEventDetails] = useState<Event | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventDetails = async () => {
      try {
        if (!eventId) return;
        const data = await fetchEventDetailsWithParticipants(eventId);
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
    return (
      <div className="text-center text-lg text-gray-500">
        Loading event details...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  if (!eventDetails) {
    return (
      <div className="text-center text-lg text-red-600">
        Event details are unavailable.
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 bg-[#313030] rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold text-white mb-4">
          {eventDetails.name}
        </h2>
        <p className="text-gray-300 mb-6">{eventDetails.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="flex flex-col space-y-2">
            <p className="text-lg text-white">
              <strong className="font-semibold">Location:</strong>{" "}
              {eventDetails.location}
            </p>
            <p className="text-lg text-white">
              <strong className="font-semibold">Date:</strong>{" "}
              {eventDetails.eventStartDate
                ? new Date(eventDetails.eventStartDate).toLocaleString()
                : "N/A"}
            </p>
            <p className="text-lg text-white">
              <strong className="font-semibold">End Date:</strong>{" "}
              {eventDetails.eventEndDate
                ? new Date(eventDetails.eventEndDate).toLocaleString()
                : "N/A"}
            </p>
            <strong className="text-sm">Available Seats:</strong>
            <span>
              {eventDetails.attendeeLimit === null
                ? `Available: ${eventDetails.availableSeats ?? 0} / No Limit`
                : `Available: ${eventDetails.availableSeats ?? 0} / ${
                    eventDetails.attendeeLimit
                  }`}
            </span>
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="text-xl font-semibold text-white">Participants</h3>
            {Array.isArray(eventDetails.participants) &&
            eventDetails.participants.length === 0 ? (
              <p className="text-gray-500">No participants yet</p>
            ) : (
              <ul className="space-y-2">
                {Array.isArray(eventDetails.participants) &&
                  eventDetails.participants.map((participant, index) => (
                    <li key={index} className="text-gray-300">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <strong className="text-sm text-gray-500">
                            Name:
                          </strong>{" "}
                          {participant.participantName}
                        </div>
                        <div>
                          <strong className="text-sm text-gray-500">
                            Department:
                          </strong>{" "}
                          {participant.departmentName || "No Department"}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailsPage;
