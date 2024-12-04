package com.app.attendify.eventParticipant.controller;

import com.app.attendify.event.model.Event;
import com.app.attendify.eventParticipant.service.EventParticipantService;
import com.app.attendify.security.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequestMapping("/api/auth/event-participant")
@RestController
public class EventParticipantController {

    private final EventParticipantService eventParticipantService;

    public EventParticipantController(EventParticipantService eventParticipantService) {
        this.eventParticipantService = eventParticipantService;
    }

    @GetMapping("/home")
    @PreAuthorize("hasRole('EVENT_PARTICIPANT')")
    public ResponseEntity<String> testEventParticipantRole() {
        return ResponseEntity.ok("You are authorized as an EVENT_PARTICIPANT!");
    }

    @GetMapping("/list-events")
    @PreAuthorize("hasRole('EVENT_PARTICIPANT')")
    public ResponseEntity<List<Event>> getEvents(@AuthenticationPrincipal User user) {
        List<Event> events = eventParticipantService.getEventsForCurrentUser(user);
        return ResponseEntity.ok(events);
    }


}
