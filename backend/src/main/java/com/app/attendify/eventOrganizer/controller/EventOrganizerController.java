package com.app.attendify.eventOrganizer.controller;

import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.dto.EventDTO;
import com.app.attendify.event.dto.UpdateEventRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.eventOrganizer.services.EventOrganizerService;
import com.app.attendify.eventParticipant.dto.EventParticipantDTO;
import com.app.attendify.eventParticipant.model.EventParticipant;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RequestMapping("/api/auth/event-organizer")
@RestController
public class EventOrganizerController {

    private static final Logger logger = LoggerFactory.getLogger(EventOrganizerController.class);


    private final EventOrganizerService eventOrganizerService;

    public EventOrganizerController(EventOrganizerService eventOrganizerService) {
        this.eventOrganizerService = eventOrganizerService;
    }

    @GetMapping("/home")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<String> testEventOrganizerRole() {
        return ResponseEntity.ok("You are authorized as an EVENT_ORGANIZER!");
    }

    @PostMapping("/create-event")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody CreateEventRequest request) {
        Event event = eventOrganizerService.createEvent(request);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/update-event/{eventId}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable int eventId, @Valid @RequestBody UpdateEventRequest request) {
        Event updatedEvent = eventOrganizerService.updateEvent(eventId, request);

        EventDTO eventDTO = new EventDTO(updatedEvent.getId(), updatedEvent.getName(), updatedEvent.getDescription(), updatedEvent.getLocation(), updatedEvent.getCompany().getName(), updatedEvent.getOrganizer().getUser().getFullName(), updatedEvent.getAvailableSlots(), updatedEvent.getEventDate(), updatedEvent.getAttendeeLimit(), updatedEvent.getJoinDeadline());

        return ResponseEntity.ok(eventDTO);
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<EventDTO>> getOrganizerEvents() {
        try {
            List<EventDTO> events = eventOrganizerService.getEventsByOrganizer();
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            logger.error("Error retrieving events", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/delete-event/{eventId}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<String> deleteEvent(@PathVariable int eventId) {
        try {
            eventOrganizerService.deleteEvent(eventId);
            return ResponseEntity.ok("Event deleted successfully.");
        } catch (Exception e) {
            logger.error("Error deleting event", e);
            return ResponseEntity.status(500).body("Error deleting event");
        }
    }

    @GetMapping("/my-events/{eventId}/participants")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<EventParticipantDTO>> getEventParticipants(@PathVariable int eventId) {
        try {
            List<EventParticipantDTO> participants = eventOrganizerService.getParticipantsByEvent(eventId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            logger.error("Error retrieving participants for event", e);
            return ResponseEntity.status(500).body(null);
        }
    }
}
