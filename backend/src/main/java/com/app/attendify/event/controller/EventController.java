package com.app.attendify.event.controller;

import com.app.attendify.event.dto.EventCreateRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.service.EventService;
import com.app.attendify.security.model.EventOrganizer;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.EventOrganizerRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final UserRepository userRepository;

    @Autowired
    public EventController(EventService eventService, EventOrganizerRepository eventOrganizerRepository, UserRepository userRepository) {
        this.eventService = eventService;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.userRepository = userRepository;
    }

    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @PostMapping("/create")
    public Event createEvent(@RequestBody EventCreateRequest eventCreateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        EventOrganizer eventOrganizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("EventOrganizer not found for the authenticated user"));

        return eventService.createEvent(eventOrganizer, eventCreateRequest.getName(), eventCreateRequest.getDescription(), eventCreateRequest.getEventDate());
    }

    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @GetMapping("/list")
    public List<Event> getEventsByOrganizer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        EventOrganizer eventOrganizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("EventOrganizer not found for the authenticated user"));

        return eventService.getEventsByOrganizer(eventOrganizer);
    }
}
