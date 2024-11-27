package com.app.attendify.event.controller;

import com.app.attendify.event.dto.EventCreateRequest;
import com.app.attendify.event.dto.EventUpdateRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.event.service.EventService;
import com.app.attendify.security.model.EventOrganizer;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.EventOrganizerRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private static final Logger logger = LoggerFactory.getLogger(EventController.class);

    private final EventService eventService;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    @Autowired
    public EventController(EventService eventService, EventOrganizerRepository eventOrganizerRepository, UserRepository userRepository, EventRepository eventRepository) {
        this.eventService = eventService;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @PostMapping("/create")
    public Event createEvent(@RequestBody EventCreateRequest eventCreateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        EventOrganizer eventOrganizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("EventOrganizer not found for the authenticated user"));

        return eventService.createEvent(eventOrganizer, eventCreateRequest.getName(), eventCreateRequest.getDescription(), eventCreateRequest.getEventDate(), eventCreateRequest.getIsEventActive());
    }

    @PutMapping("/update/{id}")
    public Event updateEvent(@PathVariable("id") Integer eventId, @RequestBody EventUpdateRequest updateRequest) {
        logger.info("Received update request for event ID: {}", eventId);
        Event updatedEvent = eventService.updateEvent(eventId, updateRequest.getName(), updateRequest.getDescription(), updateRequest.getEventDate(), updateRequest.getIsEventActive());

        if (updatedEvent != null) {
            logger.info("Event updated successfully: {}", updatedEvent);
        } else {
            logger.error("Failed to update event with ID: {}", eventId);
        }

        return updatedEvent;
    }

    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable("id") Integer eventId) {
        logger.info("Received delete request for event ID: {}", eventId);
        boolean isDeleted = eventService.deleteEventById(eventId);
        if (isDeleted) {
            return ResponseEntity.ok("Event deleted successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");
        }
    }

    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    @GetMapping("/my-events")
    public List<Event> getEventsByOrganizer() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        EventOrganizer eventOrganizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("EventOrganizer not found for the authenticated user"));

        return eventService.getEventsByOrganizer(eventOrganizer);
    }
}
