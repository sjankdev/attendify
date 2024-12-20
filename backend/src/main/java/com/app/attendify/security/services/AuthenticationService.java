package com.app.attendify.security.services;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.security.dto.LoginUserDto;
import com.app.attendify.eventOrganizer.dto.RegisterEventOrganizerDto;
import com.app.attendify.security.model.*;
import com.app.attendify.eventOrganizer.repository.EventOrganizerRepository;
import com.app.attendify.security.repositories.RoleRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

    public User registerEventOrganizer(RegisterEventOrganizerDto input) {
        RoleEnum roleEnum = RoleEnum.EVENT_ORGANIZER;

        Optional<Role> optionalRole = roleRepository.findByName(roleEnum);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found");
        }

        var organizerUser = new User().setFullName(input.getFullName()).setEmail(input.getEmail()).setPassword(passwordEncoder.encode(input.getPassword())).setRole(optionalRole.get());

        User savedUser = userRepository.save(organizerUser);

        String verificationToken = UUID.randomUUID().toString();
        savedUser.setEmailVerificationToken(verificationToken);
        sendVerificationEmail(savedUser);
        userRepository.save(savedUser);

        EventOrganizer eventOrganizer = new EventOrganizer();
        eventOrganizer.setUser(savedUser);
        eventOrganizerRepository.save(eventOrganizer);

        Company company = new Company().setName(input.getCompanyName()).setDescription(input.getCompanyDescription()).setOwner(eventOrganizer);

        companyRepository.save(company);

        eventOrganizer.setCompany(company);
        eventOrganizerRepository.save(eventOrganizer);

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

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your email before logging in.");
        }

        return user;
    }

    public Company getLoggedInOrganizerCompany() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        EventOrganizer eventOrganizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Event organizer not found"));
        return eventOrganizer.getCompany();
    }

}
