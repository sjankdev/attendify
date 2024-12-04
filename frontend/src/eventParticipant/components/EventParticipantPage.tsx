import React, { useEffect, useState } from "react";
import axios from "axios";

interface Event {
  id: number;
  name: string;
  description: string;
}

const EventParticipantPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          "https://attendify-backend-el2r.onrender.com/api/auth/event-participant/list-events", 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setEvents(response.data); 
      } catch (err: any) {
        setError("Something went wrong or you are not authorized.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); 

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error ? (
        <div style={{ color: "red" }}>{error}</div>
      ) : (
        <div>
          <h2>Events</h2>
          <ul>
            {events.length > 0 ? (
              events.map((event) => (
                <li key={event.id}>
                  <h3>{event.name}</h3>
                  <p>{event.description}</p>
                </li>
              ))
            ) : (
              <p>No events found for your company.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EventParticipantPage;
