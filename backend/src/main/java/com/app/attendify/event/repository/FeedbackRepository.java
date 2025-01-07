package com.app.attendify.event.repository;

import com.app.attendify.event.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    boolean existsByEventIdAndParticipantId(Integer eventId, Integer participantId);

}
