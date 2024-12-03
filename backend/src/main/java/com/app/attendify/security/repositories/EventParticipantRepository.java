package com.app.attendify.security.repositories;

import com.app.attendify.security.model.EventParticipant;
import com.app.attendify.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Integer> {

    EventParticipant findByUser(User user);
}
