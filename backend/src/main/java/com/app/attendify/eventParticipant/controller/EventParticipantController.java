package com.app.attendify.eventParticipant.controller;

import com.app.attendify.event.dto.EventDTO;
import com.app.attendify.event.model.Event;
import com.app.attendify.eventParticipant.service.EventParticipantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

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
    public ResponseEntity<List<EventDTO>> getMyEvents() {
        try {
            String currentUserEmail = getCurrentUserEmail();
            List<EventDTO> events = eventParticipantService.getEventsForCurrentParticipant(currentUserEmail);

            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

}
