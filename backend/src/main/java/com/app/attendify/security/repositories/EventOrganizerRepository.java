package com.app.attendify.security.repositories;

import com.app.attendify.security.model.EventOrganizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, Integer> {
}
