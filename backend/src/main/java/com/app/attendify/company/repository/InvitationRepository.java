package com.app.attendify.company.repository;

import com.app.attendify.company.model.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InvitationRepository extends JpaRepository<Invitation, Integer> {
    Optional<Invitation> findByToken(String token);
}
