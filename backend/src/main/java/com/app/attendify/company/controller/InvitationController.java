package com.app.attendify.company.controller;

import com.app.attendify.company.dto.InvitationRequestDto;
import com.app.attendify.company.model.Company;

import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.company.services.EmailService;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.security.dto.EventParticipantRegisterDto;
import com.app.attendify.security.model.EventParticipant;
import com.app.attendify.security.model.Role;
import com.app.attendify.security.model.RoleEnum;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.EventParticipantRepository;
import com.app.attendify.security.repositories.RoleRepository;
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
    private final RoleRepository roleRepository;

    public InvitationController(InvitationService invitationService, EmailService emailService, CompanyRepository companyRepository, UserRepository userRepository, EventParticipantRepository eventParticipantRepository, RoleRepository roleRepository) {
        this.invitationService = invitationService;
        this.emailService = emailService;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.eventParticipantRepository = eventParticipantRepository;
        this.roleRepository = roleRepository;
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
        System.out.println("Received token: " + token);
        try {
            Invitation invitation = invitationService.getInvitation(token);

            System.out.println("Invitation found: " + invitation);

            if (invitation.isAccepted()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invitation already accepted"));
            }

            return ResponseEntity.ok(Map.of("message", "Invitation valid, proceed to registration", "email", invitation.getEmail()));
        } catch (Exception e) {
            System.err.println("Error processing token: " + token);
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
    }

    @PostMapping("/register-participant")
    public ResponseEntity<String> registerParticipant(@RequestBody EventParticipantRegisterDto registerDto) {
        try {
            System.out.println("Received registration request for token: " + registerDto.getToken() + " and email: " + registerDto.getEmail());

            Invitation invitation = invitationService.getInvitation(registerDto.getToken());
            System.out.println("Fetched invitation: " + invitation);

            if (invitation.isAccepted()) {
                System.out.println("Invitation already accepted for token: " + registerDto.getToken());
                return ResponseEntity.badRequest().body("Invitation already accepted");
            }

            Optional<User> existingUser = userRepository.findByEmail(registerDto.getEmail());
            if (existingUser.isPresent()) {
                System.out.println("User already exists for email: " + registerDto.getEmail());
                return ResponseEntity.badRequest().body("User already exists");
            }

            System.out.println("Creating new user for email: " + registerDto.getEmail());

            Role participantRole = roleRepository.findByName(RoleEnum.EVENT_PARTICIPANT).orElseThrow(() -> new RuntimeException("Role not found"));

            User newUser = new User();
            newUser.setEmail(registerDto.getEmail());
            newUser.setFullName(registerDto.getName());
            newUser.setPassword(registerDto.getPassword()); // TODO: Hash the password
            newUser.setRole(participantRole);

            userRepository.save(newUser);
            System.out.println("User created successfully: " + newUser);

            EventParticipant eventParticipant = new EventParticipant();
            eventParticipant.setUser(newUser);
            eventParticipant.setCompany(invitation.getCompany());
            eventParticipantRepository.save(eventParticipant);

            System.out.println("Event participant created successfully: " + eventParticipant);

            invitationService.markAsAccepted(invitation);
            System.out.println("Invitation marked as accepted: " + invitation);

            return ResponseEntity.ok("Registration successful");
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }


}
