package com.app.attendify.company.controller;

import com.app.attendify.company.dto.InvitationRequestDto;
import com.app.attendify.company.model.Company;

import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.company.services.EmailService;
import com.app.attendify.company.services.InvitationService;
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
        Invitation invitation = invitationService.getInvitation(token);

        if (invitation.isAccepted()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invitation already accepted"));
        }

        Optional<User> userOptional = userRepository.findByEmail(invitation.getEmail());

        if (userOptional.isEmpty()) {
            User newUser = new User();
            newUser.setEmail(invitation.getEmail());
            newUser.setFullName("Default Name");
            newUser.setPassword("defaultPassword");

            Optional<Role> participantRole = roleRepository.findByName(RoleEnum.EVENT_PARTICIPANT);
            if (participantRole.isEmpty()) {
                throw new RuntimeException("Role not found for participant");
            }
            newUser.setRole(participantRole.get());

            userRepository.save(newUser);

            EventParticipant participant = new EventParticipant();
            participant.setUser(newUser);
            participant.setCompany(invitation.getCompany());

            eventParticipantRepository.save(participant);

            invitationService.markAsAccepted(invitation);

            return ResponseEntity.ok(Map.of("message", "User created and invitation accepted successfully"));
        }

        User user = userOptional.get();
        invitationService.markAsAccepted(invitation);

        return ResponseEntity.ok(Map.of("message", "Invitation accepted successfully"));
    }

}
