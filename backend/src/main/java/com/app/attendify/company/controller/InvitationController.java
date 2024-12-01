package com.app.attendify.company.controller;

import com.app.attendify.company.dto.InvitationRequestDto;
import com.app.attendify.company.model.Company;

import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.company.services.EmailService;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.EventParticipantRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class InvitationController {

    private final InvitationService invitationService;
    private final EmailService emailService;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EventParticipantRepository eventParticipantRepository;

    public InvitationController(InvitationService invitationService, EmailService emailService, CompanyRepository companyRepository, UserRepository userRepository, EventParticipantRepository eventParticipantRepository) {
        this.invitationService = invitationService;
        this.emailService = emailService;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.eventParticipantRepository = eventParticipantRepository;
    }

    @PostMapping("/invitation/send")
    public ResponseEntity<String> sendInvitation(@RequestBody InvitationRequestDto invitationRequestDto) {
        System.out.println("sendInvitation called with email: " + invitationRequestDto.getEmail());

        String email = invitationRequestDto.getEmail();
        Integer companyId = invitationRequestDto.getCompanyId();

        System.out.println("Fetching company with ID: " + companyId);

        Company company = companyRepository.findById(companyId).orElseThrow(() -> new RuntimeException("Company not found"));

        System.out.println("Company found: " + company.getName());

        Invitation invitation = invitationService.createInvitation(email, company);

        System.out.println("Invitation created for email: " + email + " with token: " + invitation.getToken());

        emailService.sendInvitationEmail(email, invitation.getToken());

        return ResponseEntity.ok("Invitation sent to " + email);
    }

    @GetMapping("/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(@RequestParam String token) {
        Invitation invitation = invitationService.getInvitation(token);

        if (invitation.isAccepted()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation already accepted"));
        }

        Optional<User> userOptional = userRepository.findByEmail(invitation.getEmail());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found. Please register.", "redirect", "true"));
        }

        User user = userOptional.get();
        invitationService.markAsAccepted(invitation);

        return ResponseEntity.ok(Map.of("message", "Invitation accepted successfully"));
    }

}
