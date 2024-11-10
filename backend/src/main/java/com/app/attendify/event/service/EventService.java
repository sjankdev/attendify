package com.app.attendify.event.service;

import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.security.model.EventOrganizer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(EventOrganizer eventOrganizer, String name, String description, Date eventDate) {
        Event event = new Event();
        event.setEventOrganizer(eventOrganizer).setName(name).setDescription(description).setEventDate(eventDate).setActive(true);
        return eventRepository.save(event);
    }


}
