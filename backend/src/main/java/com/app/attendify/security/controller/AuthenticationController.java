package com.app.attendify.security.controller;

import com.app.attendify.company.model.Company;
import com.app.attendify.eventParticipant.service.EventParticipantService;
import com.app.attendify.security.dto.EventParticipantRegisterDto;
import com.app.attendify.security.dto.LoginUserDto;
import com.app.attendify.security.dto.RegisterEventOrganizerDto;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.UserRepository;
import com.app.attendify.security.response.LoginResponse;
import com.app.attendify.security.services.AuthenticationService;
import com.app.attendify.security.services.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/auth")
@RestController
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;
    private final EventParticipantService eventParticipantService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService, UserRepository userRepository, EventParticipantService eventParticipantService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
        this.userRepository = userRepository;
        this.eventParticipantService = eventParticipantService;
    }

    @PostMapping("/register-organizer")
    public ResponseEntity<User> registerEventOrganizer(@RequestBody RegisterEventOrganizerDto registerEventOrganizerDto) {
        User registeredOrganizer = authenticationService.registerEventOrganizer(registerEventOrganizerDto);
        return ResponseEntity.ok(registeredOrganizer);
    }

    @PostMapping("/register-participant")
    public ResponseEntity<String> registerEventParticipant(@RequestBody EventParticipantRegisterDto registerDto) {
        try {
            eventParticipantService.registerEventParticipant(registerDto);
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

    @GetMapping("/company")
    public ResponseEntity<Company> getLoggedInOrganizerCompany() {
        Company company = authenticationService.getLoggedInOrganizerCompany();
        return ResponseEntity.ok(company);
    }

}
