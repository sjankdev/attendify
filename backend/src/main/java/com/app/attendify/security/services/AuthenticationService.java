package com.app.attendify.security.services;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.security.dto.LoginUserDto;
import com.app.attendify.security.dto.RegisterUserDto;
import com.app.attendify.security.model.*;
import com.app.attendify.security.repositories.EventOrganizerRepository;
import com.app.attendify.security.repositories.EventParticipantRepository;
import com.app.attendify.security.repositories.RoleRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final RoleRepository roleRepository;
    private final EventOrganizerRepository eventOrganizerRepository;

    private final CompanyRepository companyRepository;

    private final JavaMailSender javaMailSender;

    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, RoleRepository roleRepository, EventOrganizerRepository eventOrganizerRepository, CompanyRepository companyRepository, JavaMailSender javaMailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.companyRepository = companyRepository;
        this.javaMailSender = javaMailSender;
    }

    public User signup(RegisterUserDto input) {
        // 1. Fetch the role (EVENT_ORGANIZER)
        RoleEnum roleEnum = RoleEnum.EVENT_ORGANIZER;

        Optional<Role> optionalRole = roleRepository.findByName(roleEnum);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found");
        }

        // 2. Create the user
        var user = new User()
                .setFullName(input.getFullName())
                .setEmail(input.getEmail())
                .setPassword(passwordEncoder.encode(input.getPassword()))
                .setRole(optionalRole.get());

        // 3. Save the user
        User savedUser = userRepository.save(user);

        // 4. Create email verification token and send the email
        String verificationToken = UUID.randomUUID().toString();
        savedUser.setEmailVerificationToken(verificationToken);
        sendVerificationEmail(savedUser);
        userRepository.save(savedUser);  // Save the user again with the token

        // 5. Create the EventOrganizer for the user
        EventOrganizer eventOrganizer = new EventOrganizer();
        eventOrganizer.setUser(savedUser);
        eventOrganizerRepository.save(eventOrganizer);  // Save EventOrganizer before creating the company

        // 6. Create the company and set the event organizer as the owner
        Company company = new Company()
                .setName(input.getCompanyName())
                .setDescription(input.getCompanyDescription())
                .setOwner(eventOrganizer);  // Assign the EventOrganizer to the company

        // 7. Save the company
        companyRepository.save(company);

        // 8. Update the EventOrganizer with the company reference
        eventOrganizer.setCompany(company);
        eventOrganizerRepository.save(eventOrganizer);  // Ensure the EventOrganizer is associated with the company

        // 9. Return the saved user
        return savedUser;
    }




    private void sendVerificationEmail(User user) {
        String verificationUrl = "http://localhost:8080/api/auth/verify-email?token=" + user.getEmailVerificationToken();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Email Verification");
        message.setText("Please verify your email by clicking the link below:\n" + verificationUrl);

        javaMailSender.send(message);
    }

    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));

        User user = userRepository.findByEmail(input.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        System.out.println("User email: " + user.getEmail() + " - Email verified: " + user.isEmailVerified());

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your email before logging in.");
        }

        return user;
    }

}