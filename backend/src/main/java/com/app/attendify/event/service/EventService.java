package com.app.attendify.event.service;

import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.security.model.EventOrganizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(EventOrganizer eventOrganizer, String name, String description, Date eventDate) {
        Event event = new Event();
        event.setEventOrganizer(eventOrganizer).setName(name).setDescription(description).setEventDate(eventDate).setIsEventActive(true);

        return eventRepository.save(event);
    }

    public List<Event> getEventsByOrganizer(EventOrganizer eventOrganizer) {
        return eventRepository.findByEventOrganizer(eventOrganizer);
    }
}
