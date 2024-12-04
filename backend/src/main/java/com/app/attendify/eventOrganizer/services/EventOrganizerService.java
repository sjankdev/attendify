package com.app.attendify.eventOrganizer.services;

import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.eventOrganizer.repository.EventOrganizerRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EventOrganizerService {

    private final EventOrganizerRepository eventOrganizerRepository;
    private final EventRepository eventRepository;

    public EventOrganizerService(EventOrganizerRepository eventOrganizerRepository, EventRepository eventRepository) {
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.eventRepository = eventRepository;
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
