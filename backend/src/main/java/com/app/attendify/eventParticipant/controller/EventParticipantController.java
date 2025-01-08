package com.app.attendify.eventParticipant.controller;

import com.app.attendify.event.dto.EventFilterSummaryForParticipantDTO;
import com.app.attendify.event.dto.FeedbackDTO;
import com.app.attendify.eventParticipant.service.EventParticipantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RequestMapping("/api/auth/event-participant")
@RestController
public class EventParticipantController {

    private static final Logger logger = LoggerFactory.getLogger(EventParticipantController.class);

    private final EventParticipantService eventParticipantService;

    public EventParticipantController(EventParticipantService eventParticipantService) {
        this.eventParticipantService = eventParticipantService;
    }

    @GetMapping("/home")
    public ResponseEntity<String> testEventParticipantRole() {
        return ResponseEntity.ok("You are authorized as an EVENT_PARTICIPANT!");
    }

    @GetMapping("/my-events")
    public ResponseEntity<EventFilterSummaryForParticipantDTO> getMyEvents(@RequestParam(required = false) String filter) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            EventFilterSummaryForParticipantDTO summary = eventParticipantService.getEventsForParticipant(currentUserEmail, filter);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            logger.error("Failed to fetch events for the participant", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/feedback/{eventId}")
    public ResponseEntity<FeedbackDTO> getEventFeedback(@PathVariable Integer eventId) {
        try {
            String currentUserEmail = getCurrentUserEmail();

            FeedbackDTO feedback = eventParticipantService.getFeedbackForEvent(eventId, currentUserEmail);

            if (feedback == null) {
                return ResponseEntity.status(204).body(null);
            }

            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            logger.error("Error while fetching feedback", e);
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/submit-feedback/{eventId}")
    public ResponseEntity<String> submitFeedback(@PathVariable Integer eventId, @Valid @RequestBody FeedbackDTO feedbackDTO) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            eventParticipantService.submitFeedback(eventId, currentUserEmail, feedbackDTO.getComments(), feedbackDTO.getRating());
            return ResponseEntity.ok("Feedback submitted successfully.");
        } catch (Exception e) {
            logger.error("Error while submitting feedback", e);
            return ResponseEntity.status(500).body("Error while submitting feedback: " + e.getMessage());
        }
    }

    @PostMapping("/join-event/{eventId}")
    public ResponseEntity<String> joinEvent(@PathVariable int eventId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            eventParticipantService.joinEvent(eventId, currentUserEmail);
            return ResponseEntity.ok("Successfully joined event.");
        } catch (Exception e) {
            logger.error("Error while joining event", e);
            return ResponseEntity.status(500).body("Error while joining event: " + e.getMessage());
        }
    }

    @DeleteMapping("/unjoin-event/{eventId}")
    public ResponseEntity<String> unjoinEvent(@PathVariable Integer eventId) {
        try {
            String currentUserEmail = getCurrentUserEmail();
            logger.info("Received unjoin request. User email: {}, Event ID: {}", currentUserEmail, eventId);

            eventParticipantService.unjoinEvent(eventId, currentUserEmail);

            logger.info("User {} successfully unjoined event ID {}", currentUserEmail, eventId);
            return ResponseEntity.ok("Successfully unjoined the event.");
        } catch (Exception e) {
            logger.error("Error while unjoining event. Event ID: {}, Error: {}", eventId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Error while unjoining event: " + e.getMessage());
        }
    }


    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
