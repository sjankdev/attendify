package com.app.attendify.eventOrganizer.repository;

import com.app.attendify.event.model.Event;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, Integer> {

    Optional<EventOrganizer> findByUser(User user);

    @Query("SELECT e FROM Event e WHERE e.organizer = :organizer AND e.eventStartDate BETWEEN :startOfWeek AND :endOfWeek ORDER BY e.eventStartDate ASC")
    List<Event> findUpcomingEventsForOrganizer(@Param("organizer") EventOrganizer organizer, @Param("startOfWeek") LocalDateTime startOfWeek, @Param("endOfWeek") LocalDateTime endOfWeek);
}
