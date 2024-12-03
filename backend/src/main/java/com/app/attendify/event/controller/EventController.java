package com.app.attendify.event.controller;

import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.service.EventService;
import com.app.attendify.eventParticipant.service.EventParticipantService;
import com.app.attendify.security.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/auth/events")
public class EventController {

    private final EventService eventService;
    private final EventParticipantService eventParticipantService;

    public EventController(EventService eventService, EventParticipantService eventParticipantService) {
        this.eventService = eventService;
        this.eventParticipantService = eventParticipantService;
    }

    @PostMapping("/create")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody CreateEventRequest request) {
        Event event = eventService.createEvent(request);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/list")
    public ResponseEntity<List<Event>> getEvents(@AuthenticationPrincipal User user) {
        List<Event> events = eventParticipantService.getEventsForCurrentUser(user);
        return ResponseEntity.ok(events);
    }
}
