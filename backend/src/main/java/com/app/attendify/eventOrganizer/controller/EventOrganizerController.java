package com.app.attendify.eventOrganizer.controller;

import com.app.attendify.event.dto.AgendaItemDTO;
import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.eventOrganizer.dto.EventForOrganizersDTO;
import com.app.attendify.event.dto.EventUpdateDTO;
import com.app.attendify.event.dto.UpdateEventRequest;
import com.app.attendify.event.enums.AttendanceStatus;
import com.app.attendify.event.model.Event;
import com.app.attendify.eventOrganizer.services.EventOrganizerService;
import com.app.attendify.eventParticipant.dto.EventAttendanceDTO;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

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
    public ResponseEntity<EventUpdateDTO> updateEvent(@PathVariable int eventId, @Valid @RequestBody UpdateEventRequest request) {
        Event updatedEvent = eventOrganizerService.updateEvent(eventId, request);

        List<AgendaItemDTO> agendaItems = updatedEvent.getAgendaItems().stream().map(item -> new AgendaItemDTO(item.getId(), item.getTitle(), item.getDescription(), item.getStartTime(), item.getEndTime())).collect(Collectors.toList());

        EventUpdateDTO eventUpdateDTO = new EventUpdateDTO(updatedEvent.getId(), updatedEvent.getName(), updatedEvent.getDescription(), updatedEvent.getLocation(), updatedEvent.getCompany().getName(), updatedEvent.getOrganizer().getUser().getFullName(), updatedEvent.getAvailableSlots(), updatedEvent.getEventDate(), updatedEvent.getEventEndDate(), updatedEvent.getAttendeeLimit(), updatedEvent.getJoinDeadline(), updatedEvent.isJoinApproval(), agendaItems);

        return ResponseEntity.ok(eventUpdateDTO);
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<EventForOrganizersDTO>> getOrganizerEvents() {
        try {
            List<EventForOrganizersDTO> eventForOrganizersDTOS = eventOrganizerService.getEventsByOrganizer();
            return ResponseEntity.ok(eventForOrganizersDTOS);
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

    @PutMapping("/events/{eventId}/participants/{participantId}/status")
    public ResponseEntity<String> reviewJoinRequest(@PathVariable int eventId, @PathVariable int participantId, @RequestParam AttendanceStatus status) {
        try {
            eventOrganizerService.reviewJoinRequest(eventId, participantId, status);
            logger.info("Join request updated: Event ID={}, Participant ID={}, New Status={}", eventId, participantId, status);
            return ResponseEntity.ok("Join request updated successfully");
        } catch (RuntimeException e) {
            logger.error("Error updating join request: Event ID={}, Participant ID={}, Error={}", eventId, participantId, e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @GetMapping("/my-events/{eventId}/participants")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<EventAttendanceDTO>> getEventParticipants(@PathVariable int eventId) {
        try {
            List<EventAttendanceDTO> participants = eventOrganizerService.getParticipantsByEvent(eventId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            logger.error("Error retrieving participants for event", e);
            return ResponseEntity.status(500).body(null);
        }
    }
}
