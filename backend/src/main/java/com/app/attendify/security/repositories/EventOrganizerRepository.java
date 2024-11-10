package com.app.attendify.security.repositories;

import com.app.attendify.security.model.EventOrganizer;
import com.app.attendify.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EventOrganizerRepository extends JpaRepository<EventOrganizer, Integer> {

    Optional<EventOrganizer> findByUser(User user);
}
