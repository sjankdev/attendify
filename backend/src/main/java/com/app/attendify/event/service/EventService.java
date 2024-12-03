package com.app.attendify.event.service;

import com.app.attendify.company.model.Company;
import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.security.model.EventOrganizer;
import com.app.attendify.security.repositories.EventOrganizerRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventOrganizerRepository eventOrganizerRepository;

    public EventService(EventRepository eventRepository, EventOrganizerRepository eventOrganizerRepository) {
        this.eventRepository = eventRepository;
        this.eventOrganizerRepository = eventOrganizerRepository;
    }

    public Event createEvent(CreateEventRequest request) {
        Optional<EventOrganizer> optionalOrganizer = eventOrganizerRepository.findById(request.getOrganizerId());
        if (optionalOrganizer.isEmpty()) {
            throw new IllegalArgumentException("Organizer not found");
        }
        EventOrganizer organizer = optionalOrganizer.get();

        Event event = new Event()
                .setName(request.getName())
                .setDescription(request.getDescription())
                .setCompany(organizer.getCompany())
                .setOrganizer(organizer);
        return eventRepository.save(event);
    }
}
