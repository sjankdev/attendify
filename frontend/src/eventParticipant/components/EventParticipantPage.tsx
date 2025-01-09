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
    <div className="p-6 bg-[#151515] rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-6">Your Events</h1>
      {error && (
        <div className="text-red-500 bg-red-800 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => fetchEvents("week")}
          className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-500"
        >
          This Week ({thisWeekCount})
        </button>
        <button
          onClick={() => fetchEvents("month")}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-500"
        >
          This Month ({thisMonthCount})
        </button>
        <button
          onClick={() => fetchEvents("all")}
          className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
        >
          All Events ({allEventsCount})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
              className="bg-[#313030] rounded-lg shadow-lg p-6"
            >
              <h3 className="text-2xl font-semibold text-white">
                {event.name}
              </h3>
              <p className="text-gray-400 mt-2">{event.description}</p>
              <p className="text-gray-300 mt-2">
                <strong>Location:</strong> {event.location}
              </p>
              <p className="text-gray-300">
                <strong>Company:</strong> {event.companyName}
              </p>
              <p className="text-gray-300">
                <strong>Departments:</strong>{" "}
                {event.departmentNames.includes("All")
                  ? "All"
                  : event.departmentNames.join(", ")}
              </p>
              <p className="text-gray-300">
                <strong>Date & Time:</strong>{" "}
                {new Date(event.eventStartDate).toLocaleString()}
              </p>
              <p className="text-gray-300">
                <strong>End Date:</strong>{" "}
                {new Date(event.eventEndDate).toLocaleString()}
              </p>
              <p className="text-gray-300">
                <strong>Join Deadline:</strong>{" "}
                {new Date(event.joinDeadline).toLocaleString()}
              </p>
              <p className="text-gray-300">
                <strong>Status:</strong> {event.status}
              </p>
              <p className="text-gray-300">
                <strong>Available Seats:</strong>{" "}
                {event.joinedParticipants !== null &&
                event.attendeeLimit !== null
                  ? `${event.joinedParticipants}/${event.attendeeLimit}`
                  : "No limit"}
              </p>

              <h4 className="text-lg font-semibold text-white mt-6">Agenda</h4>
              <ul className="space-y-4 mt-4">
                {event.agendaItems.map((item: AgendaItemDTO) => (
                  <li
                    key={item.title}
                    className="border-b border-gray-600 pb-4"
                  >
                    <strong className="text-teal-400">{item.title}</strong> -{" "}
                    {item.description}
                    <br />
                    <span className="text-sm text-gray-400">
                      Start: {new Date(item.startTime).toLocaleString()}
                    </span>
                    <br />
                    <span className="text-sm text-gray-400">
                      End: {new Date(item.endTime).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <h4 className="text-lg font-semibold text-white">
                  Your Feedback
                </h4>
                {eventFeedback ? (
                  <div>
                    <p className="text-gray-300">
                      <strong>Rating:</strong> {eventFeedback.rating}/5
                    </p>
                    <p className="text-gray-300">
                      <strong>Feedback:</strong> {eventFeedback.feedback}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No feedback provided yet.</p>
                )}
              </div>

              {isJoinDeadlinePassed && isNotJoined && (
                <p className="text-red-500 mt-4">
                  The join deadline for this event has passed. You cannot join
                  this event.
                </p>
              )}

              {!isJoinDeadlinePassed && !isAccepted && !isPending && (
                <button
                  onClick={() => handleJoinEvent(event.id)}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-500 mt-4"
                >
                  Join Event
                </button>
              )}
              {(isPending || isAccepted) && !isEventEnded && (
                <button
                  onClick={() => handleUnjoinEvent(event.id)}
                  className="bg-yellow-600 text-black py-2 px-4 rounded-lg hover:bg-yellow-500 mt-4"
                >
                  Unjoin Event
                </button>
              )}

              {!isNotJoined && isEventEnded && !isFeedbackSubmitted && (
                <div className="mt-4">
                  <button
                    onClick={() => setIsFeedbackFormVisible(true)}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-500"
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
                      rows={4}
                      className="w-full p-3 bg-[#252525] text-white rounded-lg mt-2"
                    ></textarea>
                    <input
                      type="number"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      min="1"
                      max="5"
                      placeholder="Rating (1-5)"
                      className="w-full p-3 bg-[#252525] text-white rounded-lg mt-2"
                    />
                    {error && (
                      <p className="text-red-500 bg-red-800 p-2 rounded-lg mt-2">
                        {error}
                      </p>
                    )}
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() =>
                          handleSubmitFeedback(
                            event.id,
                            feedback,
                            parseInt(rating.toString())
                          )
                        }
                        className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-500"
                      >
                        Submit Feedback
                      </button>
                      <button
                        onClick={() => setIsFeedbackFormVisible(false)}
                        className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
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
