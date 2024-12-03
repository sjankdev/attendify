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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class InvitationController {

    private final InvitationService invitationService;
    private final EmailService emailService;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public InvitationController(InvitationService invitationService, EmailService emailService, CompanyRepository companyRepository, UserRepository userRepository, EventParticipantRepository eventParticipantRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.invitationService = invitationService;
        this.emailService = emailService;
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.eventParticipantRepository = eventParticipantRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/invitation/send")
    public ResponseEntity<String> sendInvitation(@RequestBody InvitationRequestDto invitationRequestDto) {
        String email = invitationRequestDto.getEmail();
        Integer companyId = invitationRequestDto.getCompanyId();

        Company company = companyRepository.findById(companyId).orElseThrow(() -> new RuntimeException("Company not found"));

        Invitation invitation = invitationService.createInvitation(email, company);

        emailService.sendInvitationEmail(email, invitation.getToken());

        return ResponseEntity.ok("Invitation sent to " + email);
    }

    @GetMapping("/accept")
    public ResponseEntity<Map<String, String>> acceptInvitation(@RequestParam String token) {
        try {
            Invitation invitation = invitationService.getInvitation(token);

            if (invitation.isAccepted()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invitation already accepted"));
            }

            return ResponseEntity.ok(Map.of("message", "Invitation valid, proceed to registration", "email", invitation.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired token"));
        }
    }

    @PostMapping("/register-participant")
    public ResponseEntity<String> registerParticipant(@RequestBody EventParticipantRegisterDto registerDto) {
        try {
            Invitation invitation = invitationService.getInvitation(registerDto.getToken());

            if (invitation.isAccepted()) {
                return ResponseEntity.badRequest().body("Invitation already accepted");
            }

            Optional<User> existingUser = userRepository.findByEmail(registerDto.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.badRequest().body("User already exists");
            }

            Role participantRole = roleRepository.findByName(RoleEnum.EVENT_PARTICIPANT).orElseThrow(() -> new RuntimeException("Role not found"));

            User newUser = new User();
            newUser.setEmail(registerDto.getEmail());
            newUser.setFullName(registerDto.getName());
            newUser.setPassword(passwordEncoder.encode(registerDto.getPassword()));
            newUser.setRole(participantRole);

            String verificationToken = UUID.randomUUID().toString();
            newUser.setEmailVerificationToken(verificationToken);
            newUser.setEmailVerified(true);

            userRepository.save(newUser);

            EventParticipant eventParticipant = new EventParticipant();
            eventParticipant.setUser(newUser);
            eventParticipant.setCompany(invitation.getCompany());
            eventParticipantRepository.save(eventParticipant);

            invitationService.markAsAccepted(invitation);

            return ResponseEntity.ok("Registration successful and email verified");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }
}
