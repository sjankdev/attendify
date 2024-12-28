package com.app.attendify.security.controller;

import com.app.attendify.company.dto.InvitationRequestDto;
import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.eventParticipant.service.EventParticipantService;
import com.app.attendify.eventParticipant.dto.EventParticipantRegisterDto;
import com.app.attendify.exceptions.EmailAlreadyExistsException;
import com.app.attendify.security.dto.LoginUserDto;
import com.app.attendify.eventOrganizer.dto.RegisterEventOrganizerDto;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.UserRepository;
import com.app.attendify.security.response.LoginResponse;
import com.app.attendify.security.services.AuthenticationService;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.security.services.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.support.DefaultMessageSourceResolvable;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequestMapping("/api/auth")
@RestController
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;
    private final EventParticipantService eventParticipantService;
    private final InvitationService invitationService;
    private final CompanyRepository companyRepository;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService, UserRepository userRepository, EventParticipantService eventParticipantService, InvitationService invitationService, CompanyRepository companyRepository) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.eventParticipantService = eventParticipantService;
        this.invitationService = invitationService;
        this.companyRepository = companyRepository;
    }

    @PostMapping("/register-organizer")
    public ResponseEntity<Object> registerEventOrganizer(
            @Valid @RequestBody RegisterEventOrganizerDto registerEventOrganizerDto,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            List<String> errorMessages = bindingResult.getAllErrors().stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errorMessages);
        }

        try {
            User registeredOrganizer = authenticationService.registerEventOrganizer(registerEventOrganizerDto);
            return ResponseEntity.ok(registeredOrganizer);
        } catch (EmailAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @PostMapping("/register-participant")
    public ResponseEntity<Object> registerEventParticipant(
            @Valid @RequestBody EventParticipantRegisterDto registerDto,
            BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            List<String> errorMessages = bindingResult.getAllErrors().stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.toList());
            return ResponseEntity.badRequest().body(errorMessages);
        }

        try {
            authenticationService.registerEventParticipant(registerDto);
            return ResponseEntity.ok("Registration successful and email verified");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) {
        User user = userRepository.findByEmailVerificationToken(token).orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email is already verified.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok("Email verified successfully!");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticate(@RequestBody LoginUserDto loginUserDto) {
        try {
            User authenticatedUser = authenticationService.authenticate(loginUserDto);

            String jwtToken = jwtService.generateToken(authenticatedUser);

            LoginResponse loginResponse = new LoginResponse().setToken(jwtToken).setExpiresIn(jwtService.getExpirationTime()).setRole(authenticatedUser.getRole().getName().name());

            return ResponseEntity.ok(loginResponse);
        } catch (RuntimeException e) {
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setMessage(e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(loginResponse);
        }
    }

    @PostMapping("/invitation/send")
    public ResponseEntity<String> sendInvitation(@RequestBody InvitationRequestDto invitationRequestDto) {
        try {
            String email = invitationRequestDto.getEmail();
            Integer companyId = invitationRequestDto.getCompanyId();
            Integer departmentId = invitationRequestDto.getDepartmentId();

            Company company = companyRepository.findById(companyId)
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            Invitation invitation = invitationService.createInvitation(email, company, departmentId);

            invitationService.sendInvitationEmail(email, invitation.getToken());

            return ResponseEntity.ok("Invitation sent to " + email);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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

    @GetMapping("/company")
    public ResponseEntity<Company> getLoggedInOrganizerCompany() {
        Company company = authenticationService.getLoggedInOrganizerCompany();
        return ResponseEntity.ok(company);
    }

}
