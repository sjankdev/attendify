package com.app.attendify.company.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInvitationEmail(String toEmail, String token) {
        System.out.println("sendInvitationEmail called with email: " + toEmail + " and token: " + token);

        String subject = "You're Invited!";
        String invitationLink = "https://attendify-frontend.onrender.com/register-participant?token=" + token;
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
}
