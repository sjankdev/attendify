package com.app.attendify.company.controller;

import com.app.attendify.company.dto.InvitationRequestDto;
import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.company.services.InvitationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class InvitationController {

    private final InvitationService invitationService;
    private final CompanyRepository companyRepository;

    public InvitationController(InvitationService invitationService, CompanyRepository companyRepository) {
        this.invitationService = invitationService;
        this.companyRepository = companyRepository;
    }

    @PostMapping("/invitation/send")
    public ResponseEntity<String> sendInvitation(@RequestBody InvitationRequestDto invitationRequestDto) {
        String email = invitationRequestDto.getEmail();
        Integer companyId = invitationRequestDto.getCompanyId();

        Company company = companyRepository.findById(companyId).orElseThrow(() -> new RuntimeException("Company not found"));

        Invitation invitation = invitationService.createInvitation(email, company);

        invitationService.sendInvitationEmail(email, invitation.getToken());

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

}
