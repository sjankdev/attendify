package com.app.attendify.security.services;


import com.app.attendify.security.dto.LoginUserDto;
import com.app.attendify.security.dto.RegisterUserDto;
import com.app.attendify.security.model.*;
import com.app.attendify.security.repositories.EventOrganizerRepository;
import com.app.attendify.security.repositories.EventParticipantRepository;
import com.app.attendify.security.repositories.RoleRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    private final RoleRepository roleRepository;
    private final EventOrganizerRepository eventOrganizerRepository;

    private final EventParticipantRepository eventParticipantRepository;

    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, RoleRepository roleRepository, EventOrganizerRepository eventOrganizerRepository, EventParticipantRepository eventParticipantRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.eventParticipantRepository = eventParticipantRepository;
    }

    public User signup(RegisterUserDto input) {
        Optional<Role> optionalRole = roleRepository.findByName(RoleEnum.valueOf(input.getRole().toUpperCase()));

        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found");
        }

        var user = new User().setFullName(input.getFullName()).setEmail(input.getEmail()).setPassword(passwordEncoder.encode(input.getPassword())).setRole(optionalRole.get());

        User savedUser = userRepository.save(user);

        if (input.getRole().equalsIgnoreCase(RoleEnum.EVENT_ORGANIZER.name())) {
            EventOrganizer eventOrganizer = new EventOrganizer();
            eventOrganizer.setUser(savedUser);
            eventOrganizerRepository.save(eventOrganizer);
        } else if (input.getRole().equalsIgnoreCase(RoleEnum.EVENT_PARTICIPANT.name())) {
            EventParticipant eventParticipant = new EventParticipant();
            eventParticipant.setUser(savedUser);
            eventParticipantRepository.save(eventParticipant);
        }

        return savedUser;
    }


    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));

        return userRepository.findByEmail(input.getEmail()).orElseThrow();
    }
}