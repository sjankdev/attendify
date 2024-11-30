package com.app.attendify.security.services;

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

    private final EventParticipantRepository eventParticipantRepository;

    private final JavaMailSender javaMailSender;

    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, RoleRepository roleRepository, EventOrganizerRepository eventOrganizerRepository, EventParticipantRepository eventParticipantRepository, JavaMailSender javaMailSender) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.eventParticipantRepository = eventParticipantRepository;
        this.javaMailSender = javaMailSender;
    }

    public User signup(RegisterUserDto input) {
        RoleEnum roleEnum;
        try {
            roleEnum = RoleEnum.valueOf(input.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Role not found: " + input.getRole());
        }

        Optional<Role> optionalRole = roleRepository.findByName(roleEnum);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found");
        }

        var user = new User().setFullName(input.getFullName()).setEmail(input.getEmail()).setPassword(passwordEncoder.encode(input.getPassword())).setRole(optionalRole.get());

        User savedUser = userRepository.save(user);

        String verificationToken = UUID.randomUUID().toString();
        savedUser.setEmailVerificationToken(verificationToken);
        sendVerificationEmail(savedUser);
        userRepository.save(savedUser);

        if (roleEnum == RoleEnum.EVENT_ORGANIZER) {
            EventOrganizer eventOrganizer = new EventOrganizer();
            eventOrganizer.setUser(savedUser);
            eventOrganizerRepository.save(eventOrganizer);
        } else if (roleEnum == RoleEnum.EVENT_PARTICIPANT) {
            EventParticipant eventParticipant = new EventParticipant();
            eventParticipant.setUser(savedUser);
            eventParticipantRepository.save(eventParticipant);
        }

        return savedUser;
    }

    private void sendVerificationEmail(User user) {
        String verificationUrl = "https://attendify-backend-el2r.onrender.com/api/auth/verify-email?token=" + user.getEmailVerificationToken();

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