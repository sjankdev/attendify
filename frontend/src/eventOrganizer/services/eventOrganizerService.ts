import axios from "axios";
import {
  DepartmentDTO,
  Event,
  FeedbackDTO,
  FeedbackSummaryDTO,
  Participant,
  UpcomingEvent,
} from "../../types/eventTypes";

export const fetchEventStatistics = async (eventId: string) => {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/event-stats/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;

    return {
      ...data,
      departmentStats: data.departmentStats || {},
      educationLevelStats: data.educationLevelStats || {},
      occupationStats: data.occupationStats || {},
      maleCount: data.maleCount || 0,
      femaleCount: data.femaleCount || 0,
      otherCount: data.otherCount || 0,
      averageAge: data.averageAge || 0,
      highestAge: data.highestAge || 0,
      lowestAge: data.lowestAge || 0,
      averageExperience: data.averageExperience || 0,
      highestExperience: data.highestExperience || 0,
      lowestExperience: data.lowestExperience || 0,
    };
  } catch (error) {
    console.error("Error fetching event statistics:", error);
    throw new Error("Failed to load event statistics.");
  }
};

export const fetchEventsWithParticipants = async (
  filter: string,
  departmentIds?: number[]
): Promise<{
  events: Event[];
  counts: { thisWeek: number; thisMonth: number; allEvents: number };
  acceptedParticipants: {
    thisWeek: number;
    thisMonth: number;
    allEvents: number;
  };
}> => {
  try {
    const queryParams = new URLSearchParams();
    if (filter) queryParams.append("filter", filter);
    if (departmentIds && departmentIds.length > 0) {
      departmentIds.forEach((id) =>
        queryParams.append("departmentIds", id.toString())
      );
    }

    const url = `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/my-events?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const data = await response.json();

    const eventsWithParticipants: Event[] = await Promise.all(
      (data.events as Event[]).map(async (event: Event): Promise<Event> => {
        try {
          const participantsResponse = await fetch(
            `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/my-events/${event.id}/participants`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (participantsResponse.ok) {
            const participants: Participant[] =
              await participantsResponse.json();
            return {
              ...event,
              participants,
              pendingRequests: event.pendingRequests,
              availableForAllDepartments: event.availableForAllDepartments,
              departments: event.departments,
            };
          }
          return event;
        } catch (error) {
          console.error(
            `Failed to fetch participants for event ID ${event.id}:`,
            error
          );
          return event;
        }
      })
    );

    return {
      events: eventsWithParticipants.map((event) => ({
        ...event,
        eventDate: new Date(event.eventStartDate).toLocaleString("en-GB", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        eventEndDate: new Date(event.eventEndDate).toLocaleString("en-GB", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        joinDeadline: event.joinDeadline
          ? new Date(event.joinDeadline).toLocaleString("en-GB", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "No Deadline",
      })),
      counts: {
        thisWeek: data.thisWeekCount,
        thisMonth: data.thisMonthCount,
        allEvents: data.allEventsCount,
      },
      acceptedParticipants: {
        thisWeek: data.thisWeekParticipants,
        thisMonth: data.thisMonthParticipants,
        allEvents: data.allEventsParticipants,
      },
    };
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const fetchEventFeedbacks = async (
  eventId: number
): Promise<FeedbackDTO[]> => {
  try {
    const url = `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/my-events/${eventId}/feedbacks`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feedbacks for event ID ${eventId}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching feedbacks for event ID ${eventId}:`, error);
    throw error;
  }
};

export const fetchEventFeedbackSummary = async (
  eventId: number
): Promise<FeedbackSummaryDTO> => {
  try {
    const url = `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/my-events/${eventId}/feedback-summary`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch feedback summary for event ID ${eventId}`
      );
    }

    return response.json();
  } catch (error) {
    console.error(
      `Error fetching feedback summary for event ID ${eventId}:`,
      error
    );
    throw error;
  }
};

export const deleteEvent = async (eventId: number): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/delete-event/${eventId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      console.log(`Event with ID ${eventId} deleted successfully`);
      return true;
    } else {
      console.error("Failed to delete event");
      return false;
    }
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
};

export const updateEvent = async (
  eventId: number,
  updatedEvent: Partial<Event>
): Promise<Event | null> => {
  try {
    const formattedEventDate = updatedEvent.eventStartDate
      ? new Date(updatedEvent.eventStartDate).toISOString()
      : null;
    const formattedJoinDeadline = updatedEvent.joinDeadline
      ? new Date(updatedEvent.joinDeadline).toISOString()
      : null;
    const formattedEventEndDate = updatedEvent.eventEndDate
      ? new Date(updatedEvent.eventEndDate).toISOString()
      : null;

    const response = await fetch(
      `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/update-event/${eventId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...updatedEvent,
          eventDate: formattedEventDate,
          eventEndDate: formattedEventEndDate,
          joinDeadline: formattedJoinDeadline,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to update event");
      return null;
    }

    const updatedEventData: Event = await response.json();
    return updatedEventData;
  } catch (error) {
    console.error("Error updating event:", error);
    return null;
  }
};

export const reviewJoinRequest = async (
  eventId: number,
  participantId: number,
  status: "ACCEPTED" | "REJECTED"
): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/events/${eventId}/participants/${participantId}/status?status=${status}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (response.ok) {
      console.log(
        `Successfully updated join request for participant ${participantId} in event ${eventId} to ${status}`
      );
      return true;
    } else {
      const error = await response.text();
      console.error(
        `Failed to update join request for participant ${participantId}: ${error}`
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Error occurred while updating join request for participant ${participantId}:`,
      error
    );
    return false;
  }
};

export const fetchUniqueParticipantsCountForThisWeek =
  async (): Promise<number> => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/participant-counts",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch participant counts.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching participant counts:", error);
      throw error;
    }
  };

export const fetchUpcomingEvents = async (): Promise<UpcomingEvent[]> => {
  try {
    const response = await fetch(
      "https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/upcoming",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upcoming events");
    }

    const events: UpcomingEvent[] = await response.json();
    return events;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

export const fetchPastMonthEvents = async (): Promise<UpcomingEvent[]> => {
  try {
    const response = await fetch(
      "https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/past-month",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch upcoming events");
    }

    const events: UpcomingEvent[] = await response.json();
    return events;
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
  }
};

export const fetchParticipantsByCompany = async (): Promise<Participant[]> => {
  try {
    const response = await fetch(
      "https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/company/participants",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch participants from company");
    }

    const participants: Participant[] = await response.json();
    return participants;
  } catch (error) {
    console.error("Error fetching participants from company:", error);
    throw error;
  }
};

export const fetchDepartmentsByCompany = async (): Promise<DepartmentDTO[]> => {
  try {
    const response = await fetch(
      "https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/company/departments",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch departments from company");
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching departments from company:", error);
    throw error;
  }
};

export const fetchEventDetails = async (eventId: string): Promise<any> => {
  try {
    const response = await fetch(
      `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/event-details/${eventId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch event details");
    }

    const eventDetails = await response.json();
    return eventDetails;
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }
};

export const addDepartments = async (
  departmentNames: string[],
  companyId: number
): Promise<void> => {
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      `https://attendify-backend-el2r.onrender.com/api/auth/event-organizer/${companyId}/add-departments`,
      departmentNames,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error adding departments:", error);
    throw new Error("Failed to add departments");
  }
};
