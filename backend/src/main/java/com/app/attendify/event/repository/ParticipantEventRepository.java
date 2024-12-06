package com.app.attendify.event.repository;

import com.app.attendify.event.model.ParticipantEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantEventRepository extends JpaRepository<ParticipantEvent, Integer> {
    boolean existsByParticipantIdAndEventId(Integer participantId, Integer eventId);
}
