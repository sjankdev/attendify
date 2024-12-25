package com.app.attendify.company.services;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.InvitationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final JavaMailSender mailSender;

    public InvitationService(InvitationRepository invitationRepository, JavaMailSender mailSender) {
        this.invitationRepository = invitationRepository;
        this.mailSender = mailSender;
    }

    public void sendInvitationEmail(String toEmail, String token) {
        System.out.println("sendInvitationEmail called with email: " + toEmail + " and token: " + token);

        String subject = "You're Invited!";
        String invitationLink = "http://localhost:3000/register-participant?token=" + token;
        String message = "Click the following link to complete your registration: " + invitationLink;

        System.out.println("Email content: ");
        System.out.println("Subject: " + subject);
        System.out.println("Message: " + message);

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setTo(toEmail);
            email.setSubject(subject);
            email.setText(message);

            System.out.println("Sending email to: " + toEmail);

            mailSender.send(email);

            System.out.println("Email sent successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public Invitation createInvitation(String email, Company company) {
        System.out.println("Creating invitation for email: " + email + " and company: " + company.getName());

        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be empty.");
        }

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
