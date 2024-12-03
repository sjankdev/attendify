package com.app.attendify.company.services;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.InvitationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class InvitationService {
    private final InvitationRepository invitationRepository;

    public InvitationService(InvitationRepository invitationRepository) {
        this.invitationRepository = invitationRepository;
    }

    public Invitation createInvitation(String email, Company company) {
        System.out.println("Creating invitation for email: " + email + " and company: " + company.getName());

        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setCompany(company);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setExpirationDate(LocalDateTime.now().plusDays(7));
        invitation.setAccepted(false);

        invitation.setCreatedAt(LocalDateTime.now());

        System.out.println("Invitation details: Email: " + email + ", Token: " + invitation.getToken());

        invitation = invitationRepository.save(invitation);

        System.out.println("Invitation saved with token: " + invitation.getToken());
        return invitation;
    }


    public Invitation getInvitation(String token) {
        return invitationRepository.findByToken(token).orElseThrow(() -> new RuntimeException("Invalid or expired invitation token"));
    }

    public void markAsAccepted(Invitation invitation) {
        invitation.setAccepted(true);
        invitationRepository.save(invitation);
    }
}
