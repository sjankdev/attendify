package com.app.attendify.eventParticipant.repository;

import com.app.attendify.eventParticipant.model.EventParticipant;
import com.app.attendify.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Integer> {

    EventParticipant findByUser(User user);
}
