package com.app.attendify.event.service;

import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.security.model.EventOrganizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Date;
import java.util.List;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(EventOrganizer eventOrganizer, String name, String description, Date eventDate, Boolean isEventActive) {
        Event event = new Event();
        event.setEventOrganizer(eventOrganizer).setName(name).setDescription(description).setEventDate(eventDate).setIsEventActive(isEventActive);

        return eventRepository.save(event);
    }

    public Event updateEvent(Integer eventId, String name, String description, Date eventDate, Boolean isEventActive) {
        logger.info("Attempting to update event with ID: {}", eventId);
        Event event = eventRepository.findById(eventId).orElse(null);

        if (event == null) {
            logger.error("Event with ID {} not found", eventId);
            return null;
        }

        event.setName(name);
        event.setDescription(description);
        event.setEventDate(eventDate);
        event.setIsEventActive(isEventActive);

        logger.info("Updated event details: {}", event);
        return eventRepository.save(event);
    }

    public List<Event> getEventsByOrganizer(EventOrganizer eventOrganizer) {
        return eventRepository.findByEventOrganizer(eventOrganizer);
    }
}
