import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  updateEvent,
  fetchEventsWithParticipants,
} from "../services/eventOrganizerService";
import { Event, AgendaItem } from "../../types/eventTypes";

const UpdateEventPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Partial<Event> | null>(null);
  const [updatedEvent, setUpdatedEvent] = useState<Partial<Event>>({});
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const events = await fetchEventsWithParticipants();
        const currentEvent = events.find(
          (event) => event.id === Number(eventId)
        );
        setEvent(currentEvent || null);
        if (currentEvent) {
          setUpdatedEvent(currentEvent);
          setAgendaItems(currentEvent.agendaItems || []);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
        setError("Failed to load event.");
      }
    };
    loadEvent();
  }, [eventId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedEvent((prevEvent) => ({
      ...prevEvent,
      [name]: name === "attendeeLimit" ? parseInt(value, 10) : value,
    }));
  };

  const handleAgendaItemChange = (
    index: number,
    field: keyof AgendaItem,
    value: string
  ) => {
    const updatedAgenda = [...agendaItems];
    updatedAgenda[index] = { ...updatedAgenda[index], [field]: value };
    setAgendaItems(updatedAgenda);
  };

  const handleAddAgendaItem = () => {
    setAgendaItems([
      ...agendaItems,
      { title: "", description: "", startTime: "", endTime: "" },
    ]);
  };

  const handleRemoveAgendaItem = (index: number) => {
    const updatedAgenda = agendaItems.filter((_, i) => i !== index);
    setAgendaItems(updatedAgenda);
  };

  const handleUpdateEvent = async () => {
    if (!event || !event.id) return;

    const updatedEventData = await updateEvent(event.id, {
      ...updatedEvent,
      agendaItems,
    });
    if (updatedEventData) {
      navigate("/event-organizer/events");
    } else {
      setError("Failed to update event.");
    }
  };

  return (
    <div>
      <h3>Update Event</h3>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {event && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateEvent();
          }}
        >
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={updatedEvent.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={updatedEvent.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Location:</label>
            <input
              type="text"
              name="location"
              value={updatedEvent.location}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Event Date:</label>
            <input
              type="datetime-local"
              name="eventDate"
              value={updatedEvent.eventDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Event End Date:</label>
            <input
              type="datetime-local"
              name="eventEndDate"
              value={updatedEvent.eventEndDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Join Deadline:</label>
            <input
              type="datetime-local"
              name="joinDeadline"
              value={updatedEvent.joinDeadline}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Attendee Limit:</label>
            <input
              type="number"
              name="attendeeLimit"
              value={updatedEvent.attendeeLimit}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="joinApproval"
                checked={updatedEvent.joinApproval}
                onChange={(e) =>
                  setUpdatedEvent({
                    ...updatedEvent,
                    joinApproval: e.target.checked,
                  })
                }
              />
              Join Approval
            </label>
          </div>

          <h4>Agenda Items</h4>
          {agendaItems.map((item, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Title"
                value={item.title}
                onChange={(e) =>
                  handleAgendaItemChange(index, "title", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleAgendaItemChange(index, "description", e.target.value)
                }
              />
              <input
                type="datetime-local"
                value={item.startTime}
                onChange={(e) =>
                  handleAgendaItemChange(index, "startTime", e.target.value)
                }
              />
              <input
                type="datetime-local"
                value={item.endTime}
                onChange={(e) =>
                  handleAgendaItemChange(index, "endTime", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => handleRemoveAgendaItem(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddAgendaItem}>
            Add Agenda Item
          </button>
          <button type="submit">Update Event</button>
        </form>
      )}
    </div>
  );
};

export default UpdateEventPage;
