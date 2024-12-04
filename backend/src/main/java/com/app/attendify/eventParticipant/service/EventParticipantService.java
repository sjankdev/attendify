package com.app.attendify.eventParticipant.service;

import com.app.attendify.company.model.Invitation;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.eventParticipant.dto.EventParticipantRegisterDto;
import com.app.attendify.eventParticipant.model.EventParticipant;
import com.app.attendify.security.model.Role;
import com.app.attendify.security.model.RoleEnum;
import com.app.attendify.security.model.User;
import com.app.attendify.eventParticipant.repository.EventParticipantRepository;
import com.app.attendify.security.repositories.RoleRepository;
import com.app.attendify.security.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EventParticipantService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final InvitationService invitationService;
    private final PasswordEncoder passwordEncoder;
    private final EventRepository eventRepository;

    @Autowired
    public EventParticipantService(UserRepository userRepository, RoleRepository roleRepository, EventParticipantRepository eventParticipantRepository, InvitationService invitationService, PasswordEncoder passwordEncoder, EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.eventParticipantRepository = eventParticipantRepository;
        this.invitationService = invitationService;
        this.passwordEncoder = passwordEncoder;
        this.eventRepository = eventRepository;
    }

    public void registerEventParticipant(EventParticipantRegisterDto input) {
        Invitation invitation = validateInvitation(input.getToken());

        if (userRepository.findByEmail(input.getEmail()).isPresent()) {
            throw new IllegalArgumentException("User already exists");
        }

        User newUser = createUser(input);

        createEventParticipant(newUser, invitation);

        invitationService.markAsAccepted(invitation);
    }


    private Invitation validateInvitation(String token) {
        Invitation invitation = invitationService.getInvitation(token);
        if (invitation.isAccepted()) {
            throw new IllegalArgumentException("Invitation already accepted");
        }
        return invitation;
    }


    private User createUser(EventParticipantRegisterDto input) {
        Role participantRole = roleRepository.findByName(RoleEnum.EVENT_PARTICIPANT).orElseThrow(() -> new RuntimeException("Role not found"));

        User newUser = new User().setEmail(input.getEmail()).setFullName(input.getName()).setPassword(passwordEncoder.encode(input.getPassword())).setRole(participantRole).setEmailVerificationToken(UUID.randomUUID().toString()).setEmailVerified(true);

        return userRepository.save(newUser);
    }


    private EventParticipant createEventParticipant(User user, Invitation invitation) {
        EventParticipant eventParticipant = new EventParticipant().setUser(user).setCompany(invitation.getCompany());

        return eventParticipantRepository.save(eventParticipant);
    }

    public List<Event> getEventsForCurrentUser(User user) {
        EventParticipant eventParticipant = eventParticipantRepository.findByUser(user);

        if (eventParticipant != null && eventParticipant.getCompany() != null) {
            return eventRepository.findByCompany(eventParticipant.getCompany());
        } else {
            return List.of();
        }
    }

}
