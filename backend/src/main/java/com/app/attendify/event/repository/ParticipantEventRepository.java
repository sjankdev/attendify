package com.app.attendify.event.repository;

import com.app.attendify.event.model.ParticipantEvent;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantEventRepository extends JpaRepository<ParticipantEvent, Integer> {
    boolean existsByParticipantIdAndEventId(Integer participantId, Integer eventId);

    @Transactional
    @Modifying
    @Query("DELETE FROM ParticipantEvent pe WHERE pe.participant.id = :participantId AND pe.event.id = :eventId")
    void deleteByParticipantIdAndEventId(@Param("participantId") Integer participantId, @Param("eventId") Integer eventId);

}
