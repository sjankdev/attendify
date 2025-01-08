import React, { useEffect, useState } from "react";
import axios from "axios";
import { AgendaItemDTO } from "../../types/eventTypes";

const EventParticipantPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [thisWeekCount, setThisWeekCount] = useState<number>(0);
  const [thisMonthCount, setThisMonthCount] = useState<number>(0);
  const [allEventsCount, setAllEventsCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [rating, setRating] = useState<number | string>("");
  const [eventFeedbacks, setEventFeedbacks] = useState<
    { eventId: number; feedback: string; rating: number }[]
  >([]);

  const [isFeedbackFormVisible, setIsFeedbackFormVisible] =
    useState<boolean>(false);

  const handleJoinEvent = async (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/auth/event-participant/join-event/${eventId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Event joined successfully:", response.data);
      setError(null);
      alert("Successfully joined the event!");
      fetchEvents();
    } catch (err: any) {
      console.error("Error joining event:", err);
      setError(
        err.response?.data ||
          "Error joining event. Please check your connection."
      );
    }
  };

  const handleUnjoinEvent = async (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/auth/event-participant/unjoin-event/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Event unjoined successfully:", response.data);
      setError(null);
      alert("Successfully unjoined the event!");
      fetchEvents();
    } catch (err: any) {
      console.error("Error unjoining event:", err);
      setError(
        err.response?.data ||
          "Error unjoining event. Please check your connection."
      );
    }
  };

  const fetchEventFeedback = async (eventId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/api/auth/event-participant/feedback/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 204) {
        console.log("No feedback available for event:", eventId);
        return;
      }

      if (response.data) {
        setEventFeedbacks((prevFeedbacks) => [
          ...prevFeedbacks.filter((item) => item.eventId !== eventId),
          {
            eventId,
            feedback: response.data.comments,
            rating: response.data.rating,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
      setError("Failed to fetch feedback.");
    }
  };

  const handleSubmitFeedback = async (
    eventId: number,
    comments: string,
    rating: number
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      setError("No token found. Please log in.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Rating must be between 1 and 5");
      return;
    }

    if (comments.trim() === "") {
      setError("Feedback cannot be empty");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:8080/api/auth/event-participant/submit-feedback/${eventId}`,
        { comments, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Feedback submitted successfully:", response.data);
      setError(null);
      alert("Feedback submitted successfully!");

      fetchEventFeedback(eventId);
      setIsFeedbackFormVisible(false);
      fetchEvents();
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(
        err.response?.data ||
          "Error submitting feedback. Please check your connection."
      );
    }
  };

  const fetchEvents = async (filter?: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:8080/api/auth/event-participant/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            filter: filter,
          },
        }
      );

      if (response.data) {
        console.log("Fetched events:", response.data.events);
        setEvents(response.data.events);
        setThisWeekCount(response.data.thisWeekCount);
        setThisMonthCount(response.data.thisMonthCount);
        setAllEventsCount(response.data.allEventsCount);
        setError(null);
      } else {
        setError("No events found.");
      }
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to fetch events.");
    }
  };

  useEffect(() => {
    fetchEvents();
    events.forEach((event) => {
      fetchEventFeedback(event.id);
    });
  }, [events]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Your Events</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => fetchEvents("week")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          This Week ({thisWeekCount})
        </button>
        <button
          onClick={() => fetchEvents("month")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          This Month ({thisMonthCount})
        </button>
        <button
          onClick={() => fetchEvents("all")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          All Events ({allEventsCount})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const currentTime = new Date();
          const joinDeadline = new Date(event.joinDeadline);
          const isJoinDeadlinePassed = currentTime > joinDeadline;
          const isPending = event.status === "PENDING";
          const isAccepted = event.status === "ACCEPTED";
          const isNotJoined = event.status === "NOT_JOINED";
          const eventEndDate = new Date(event.eventEndDate);
          const isEventEnded = currentTime > eventEndDate;
          const isFeedbackSubmitted = event.feedbackSubmitted;

          const eventFeedback = eventFeedbacks.find(
            (feedback) => feedback.eventId === event.id
          );

          return (
            <div
              key={event.id}
              className="p-4 border rounded shadow hover:shadow-lg"
            >
              <h3 className="text-xl font-bold mb-2">{event.name}</h3>
              <p className="text-gray-700 mb-2">{event.description}</p>
              <p className="text-gray-500">
                <strong>Location:</strong> {event.location}
              </p>
              <p className="text-gray-500">
                <strong>Company:</strong> {event.companyName}
              </p>
              <p className="text-gray-500">
                <strong>Departments:</strong>{" "}
                {event.departmentNames.includes("All")
                  ? "All"
                  : event.departmentNames.join(", ")}
              </p>
              <p className="text-gray-500">
                <strong>Date & Time:</strong>{" "}
                {new Date(event.eventStartDate).toLocaleString()}
              </p>
              <p className="text-gray-500">
                <strong>End Date:</strong>{" "}
                {new Date(event.eventEndDate).toLocaleString()}
              </p>
              <p className="text-gray-500">
                <strong>Join Deadline:</strong>{" "}
                {new Date(event.joinDeadline).toLocaleString()}
              </p>
              <p className="text-gray-500">
                <strong>Status:</strong> {event.status}
              </p>
              <p className="text-gray-500">
                <strong>Available Seats:</strong>{" "}
                {event.joinedParticipants !== null &&
                event.attendeeLimit !== null
                  ? `${event.joinedParticipants}/${event.attendeeLimit}`
                  : "No limit"}
              </p>

              <h4 className="text-lg font-semibold mt-4">Agenda</h4>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                {event.agendaItems.map((item: AgendaItemDTO) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong> - {item.description}
                    <br />
                    <span className="text-sm">
                      Start: {new Date(item.startTime).toLocaleString()}
                    </span>
                    <br />
                    <span className="text-sm">
                      End: {new Date(item.endTime).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4">
                <h4 className="font-semibold">Your Feedback</h4>
                {eventFeedback ? (
                  <div className="border-t pt-2">
                    <p>
                      <strong>Rating:</strong> {eventFeedback.rating}/5
                    </p>
                    <p>
                      <strong>Feedback:</strong> {eventFeedback.feedback}
                    </p>
                  </div>
                ) : (
                  <p className="italic text-gray-500">
                    No feedback provided yet.
                  </p>
                )}
              </div>

              {isJoinDeadlinePassed && isNotJoined && (
                <p className="text-gray-500 italic">
                  The join deadline for this event has passed. You cannot join
                  this event.
                </p>
              )}

              {!isJoinDeadlinePassed && !isAccepted && !isPending && (
                <button
                  onClick={() => handleJoinEvent(event.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                >
                  Join Event
                </button>
              )}
              {(isPending || isAccepted) && !isEventEnded && (
                <button
                  onClick={() => handleUnjoinEvent(event.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full mt-2"
                >
                  Unjoin Event
                </button>
              )}

              {!isNotJoined && isEventEnded && !isFeedbackSubmitted && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsFeedbackFormVisible(true)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full"
                  >
                    Leave Feedback
                  </button>
                </div>
              )}

              {isFeedbackFormVisible &&
                isAccepted &&
                !isFeedbackSubmitted &&
                isEventEnded &&
                !isNotJoined && (
                  <div className="mt-4">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Write your feedback here..."
                      className="w-full p-2 border rounded"
                      rows={4}
                    ></textarea>
                    <input
                      type="number"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      min="1"
                      max="5"
                      placeholder="Rating (1-5)"
                      className="w-full p-2 border rounded mt-2"
                    />
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                    <div className="flex space-x-4 mt-2">
                      <button
                        onClick={() =>
                          handleSubmitFeedback(
                            event.id,
                            feedback,
                            parseInt(rating.toString())
                          )
                        }
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
                      >
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => setIsFeedbackFormVisible(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 w-full"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventParticipantPage;
