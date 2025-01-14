package com.app.attendify.eventOrganizer.controller;

import com.app.attendify.company.dto.DepartmentDto;
import com.app.attendify.company.services.CompanyService;
import com.app.attendify.event.dto.*;
import com.app.attendify.event.enums.AttendanceStatus;
import com.app.attendify.event.model.Event;
import com.app.attendify.eventOrganizer.services.EventOrganizerService;
import com.app.attendify.eventParticipant.dto.EventAttendanceDTO;
import com.app.attendify.eventParticipant.dto.EventParticipantDTO;
import com.app.attendify.eventParticipant.enums.Gender;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/api/auth/event-organizer")
@RestController
public class EventOrganizerController {

    private static final Logger logger = LoggerFactory.getLogger(EventOrganizerController.class);

    private final EventOrganizerService eventOrganizerService;
    private final CompanyService companyService;

    public EventOrganizerController(EventOrganizerService eventOrganizerService, CompanyService companyService) {
        this.eventOrganizerService = eventOrganizerService;
        this.companyService = companyService;
    }

    @GetMapping("/home")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<String> testEventOrganizerRole() {
        return ResponseEntity.ok("You are authorized as an EVENT_ORGANIZER!");
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<EventFilterSummaryForOrganizerDTO> getOrganizerEvents(@RequestParam(required = false) String filter, @RequestParam(required = false) List<Integer> departmentIds) {
        try {
            EventFilterSummaryForOrganizerDTO summary = eventOrganizerService.getEventsByOrganizer(filter, departmentIds);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Error retrieving events", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/create-event")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody CreateEventRequest request) {
        logger.info("Creating event with request: {}", request);
        Event event = eventOrganizerService.createEvent(request);
        logger.info("Event created successfully: {}", event);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/update-event/{eventId}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<EventUpdateDTO> updateEvent(@PathVariable int eventId, @Valid @RequestBody UpdateEventRequest request) {
        Event updatedEvent = eventOrganizerService.updateEvent(eventId, request);

        List<AgendaItemDTO> agendaItems = updatedEvent.getAgendaItems().stream().map(item -> new AgendaItemDTO(item.getId(), item.getTitle(), item.getDescription(), item.getStartTime(), item.getEndTime())).collect(Collectors.toList());

        EventUpdateDTO eventUpdateDTO = new EventUpdateDTO(updatedEvent.getId(), updatedEvent.getName(), updatedEvent.getDescription(), updatedEvent.getLocation(), updatedEvent.getCompany().getName(), updatedEvent.getOrganizer().getUser().getFullName(), updatedEvent.getAvailableSlots(), updatedEvent.getEventStartDate(), updatedEvent.getEventEndDate(), updatedEvent.getAttendeeLimit(), updatedEvent.getJoinDeadline(), updatedEvent.isJoinApproval(), agendaItems);

        return ResponseEntity.ok(eventUpdateDTO);
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
    public ResponseEntity<List<EventAttendanceDTO>> getEventParticipants(@PathVariable int eventId) {
        try {
            List<EventAttendanceDTO> participants = eventOrganizerService.getParticipantsByEvent(eventId);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            logger.error("Error retrieving participants for event", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/event-details/{eventId}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<EventDetailDTO> getEventDetails(@PathVariable int eventId) {
        try {
            EventDetailDTO eventDetails = eventOrganizerService.getEventDetails(eventId);
            return ResponseEntity.ok(eventDetails);
        } catch (Exception e) {
            logger.error("Error retrieving event details", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/my-events/{eventId}/feedbacks")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<FeedbackOrganizerDTO>> getEventFeedbacks(@PathVariable int eventId) {
        try {
            List<FeedbackOrganizerDTO> feedbacks = eventOrganizerService.getFeedbacksByEvent(eventId);
            return ResponseEntity.ok(feedbacks);
        } catch (Exception e) {
            logger.error("Error retrieving feedbacks for event", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/my-events/{eventId}/feedback-summary")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<FeedbackSummaryDTO> getEventFeedbackSummary(@PathVariable int eventId) {
        try {
            FeedbackSummaryDTO feedbackSummary = eventOrganizerService.getFeedbackSummaryByEvent(eventId);
            return ResponseEntity.ok(feedbackSummary);
        } catch (Exception e) {
            logger.error("Error retrieving feedback summary for event", e);
            return ResponseEntity.status(500).body(null);
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

    @GetMapping("/company/participants")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<EventParticipantDTO>> getParticipantsByCompany() {
        try {
            List<EventParticipantDTO> participants = eventOrganizerService.getParticipantsByCompany();
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            logger.error("Error retrieving participants for organizer's company", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/statistics/gender")
    public ResponseEntity<Map<Integer, Map<Gender, Long>>> getGenderStatistics() {
        Map<Integer, Map<Gender, Long>> statistics = eventOrganizerService.getGenderStatistics();
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/event-stats/{eventId}")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<EventStatisticsDTO> getEventStatistics(@PathVariable Integer eventId) {
        try {
            EventStatisticsDTO stats = eventOrganizerService.getEventStatistics(eventId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving event statistics for eventId: {}", eventId, e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/company/departments")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<List<DepartmentDto>> getDepartmentsByCompany() {
        try {
            List<DepartmentDto> departments = eventOrganizerService.getDepartmentsByCompany();
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            logger.error("Error retrieving departments for organizer's company", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/{companyId}/add-departments")
    public ResponseEntity<Void> addDepartments(@PathVariable Integer companyId, @RequestBody List<String> departmentNames) {
        try {
            companyService.addDepartmentsToCompany(companyId, departmentNames);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
