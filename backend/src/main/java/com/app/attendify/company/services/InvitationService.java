package com.app.attendify.company.services;

import com.app.attendify.company.dto.InvitationRequestDto;
import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Department;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.DepartmentRepository;
import com.app.attendify.company.repository.InvitationRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final JavaMailSender mailSender;
    private final DepartmentRepository departmentRepository;

    public InvitationService(InvitationRepository invitationRepository, JavaMailSender mailSender, DepartmentRepository departmentRepository) {
        this.invitationRepository = invitationRepository;
        this.mailSender = mailSender;
        this.departmentRepository = departmentRepository;
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

    public Invitation createInvitation(String email, Company company, Integer departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid department"));

        Invitation invitation = new Invitation();
        invitation.setEmail(email);
        invitation.setCompany(company);
        invitation.setDepartment(department);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setExpirationDate(LocalDateTime.now().plusDays(7));
        invitation.setAccepted(false);
        invitation.setCreatedAt(LocalDateTime.now());

        invitation = invitationRepository.save(invitation);
        return invitation;
    }

    public void sendBulkInvitations(List<InvitationRequestDto.EmailDepartment> emailDepartments, Company company) {
        for (InvitationRequestDto.EmailDepartment emailDepartment : emailDepartments) {
            Integer departmentId = emailDepartment.getDepartmentId();
            String email = emailDepartment.getEmail();

            Invitation invitation = createInvitation(email, company, departmentId);

            sendInvitationEmail(email, invitation.getToken());
        }
    }

    public Invitation getInvitation(String token) {
        return invitationRepository.findByToken(token).orElseThrow(() -> new RuntimeException("Invalid or expired invitation token"));
    }

    public void markAsAccepted(Invitation invitation) {
        invitation.setAccepted(true);
        invitationRepository.save(invitation);
    }
}
