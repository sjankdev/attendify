package com.app.attendify.event.controller;

import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/create")
    public ResponseEntity<Event> createEvent(@Valid @RequestBody CreateEventRequest request) {
        Event event = eventService.createEvent(request);
        return ResponseEntity.ok(event);
    }
}
