package com.app.attendify.event.repository;

import com.app.attendify.event.model.Event;
import com.app.attendify.security.model.EventOrganizer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByEventOrganizer(EventOrganizer eventOrganizer);

}
