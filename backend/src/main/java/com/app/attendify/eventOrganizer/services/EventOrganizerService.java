package com.app.attendify.eventOrganizer.services;

import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.eventOrganizer.repository.EventOrganizerRepository;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EventOrganizerService {

    private static final Logger logger = LoggerFactory.getLogger(EventOrganizerService.class);

    private final EventOrganizerRepository eventOrganizerRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventOrganizerService(EventOrganizerRepository eventOrganizerRepository, EventRepository eventRepository, UserRepository userRepository) {
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    public Event createEvent(CreateEventRequest request) {
        try {
            Optional<EventOrganizer> optionalOrganizer = eventOrganizerRepository.findById(request.getOrganizerId());
            if (optionalOrganizer.isEmpty()) {
                logger.error("Organizer not found for ID: {}", request.getOrganizerId());
                throw new IllegalArgumentException("Organizer not found");
            }
            EventOrganizer organizer = optionalOrganizer.get();

            Event event = new Event().setName(request.getName()).setDescription(request.getDescription()).setCompany(organizer.getCompany()).setOrganizer(organizer);
            logger.info("Creating event: {}", event.getName());
            return eventRepository.save(event);
        } catch (Exception e) {
            logger.error("Error creating event", e);
            throw new RuntimeException("Error creating event", e);
        }
    }

    @Transactional
    public List<Event> getEventsByOrganizer() {
        try {
            UserDetails currentUser = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = currentUser.getUsername();
            logger.info("Fetching events for organizer: {}", email);

            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("User not found for username: {}", email);
                return new IllegalArgumentException("User not found");
            });

            EventOrganizer organizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> {
                logger.error("Event organizer not found for user: {}", email);
                return new IllegalArgumentException("Organizer not found");
            });

            logger.info("Found {} events for organizer: {}", organizer.getEvents().size(), email);
            return organizer.getEvents();
        } catch (Exception e) {
            logger.error("Error fetching events for organizer", e);
            throw new RuntimeException("Error fetching events for organizer", e);
        }
    }
}
