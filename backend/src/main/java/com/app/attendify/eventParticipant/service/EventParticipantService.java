package com.app.attendify.eventParticipant.service;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.event.dto.EventDTO;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.model.ParticipantEvent;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.event.repository.ParticipantEventRepository;
import com.app.attendify.eventParticipant.dto.EventParticipantRegisterDto;
import com.app.attendify.eventParticipant.model.EventParticipant;
import com.app.attendify.security.model.Role;
import com.app.attendify.security.model.RoleEnum;
import com.app.attendify.security.model.User;
import com.app.attendify.eventParticipant.repository.EventParticipantRepository;
import com.app.attendify.security.repositories.RoleRepository;
import com.app.attendify.security.repositories.UserRepository;
import jakarta.transaction.Transactional;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventParticipantService {

    private static final Logger log = LoggerFactory.getLogger(EventParticipantService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EventParticipantRepository eventParticipantRepository;
    private final InvitationService invitationService;
    private final PasswordEncoder passwordEncoder;
    private final EventRepository eventRepository;
    private final ParticipantEventRepository participantEventRepository;

    @Autowired
    public EventParticipantService(UserRepository userRepository, RoleRepository roleRepository, EventParticipantRepository eventParticipantRepository, InvitationService invitationService, PasswordEncoder passwordEncoder, EventRepository eventRepository, ParticipantEventRepository participantEventRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.eventParticipantRepository = eventParticipantRepository;
        this.invitationService = invitationService;
        this.passwordEncoder = passwordEncoder;
        this.eventRepository = eventRepository;
        this.participantEventRepository = participantEventRepository;
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

    @Transactional
    public List<EventDTO> getEventsForCurrentParticipant(String currentUserEmail) {
        EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(currentUserEmail).orElseThrow(() -> new RuntimeException("Event Participant not found for the current user"));

        Company participantCompany = eventParticipant.getCompany();
        if (participantCompany == null) {
            throw new RuntimeException("The participant does not belong to any company.");
        }

        log.info("Participant company: {}", participantCompany.getName());

        List<Event> events = eventRepository.findByCompany(participantCompany);

        return events.stream().map(event -> {
            Integer availableSeats = event.getAvailableSlots();
            return new EventDTO(event.getId(), event.getName(), event.getDescription(), event.getLocation(), event.getCompany().getName(), event.getOrganizer() != null && event.getOrganizer().getUser() != null ? event.getOrganizer().getUser().getFullName() : null, availableSeats);
        }).collect(Collectors.toList());
    }


    @Transactional
    public void joinEvent(int eventId, String userEmail) {
        log.info("Received request to join event with ID: {}", eventId);
        try {
            Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
            EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(userEmail).orElseThrow(() -> new RuntimeException("Participant not found"));

            Company participantCompany = eventParticipant.getCompany();
            Company eventCompany = event.getCompany();
            if (participantCompany == null || eventCompany == null || !participantCompany.getId().equals(eventCompany.getId())) {
                log.error("Participant company does not match event company. Participant email: {}, Event ID: {}", userEmail, eventId);
                throw new RuntimeException("You cannot join an event outside your company");
            }

            boolean alreadyJoined = participantEventRepository.existsByParticipantIdAndEventId(eventParticipant.getId(), eventId);
            if (alreadyJoined) {
                log.error("Participant has already joined this event. Participant email: {}, Event ID: {}", userEmail, eventId);
                throw new RuntimeException("You have already joined this event");
            }

            if (event.getAttendeeLimit() != null && event.getAvailableSlots() <= 0) {
                log.error("Event has no available slots. Event ID: {}", eventId);
                throw new RuntimeException("This event has reached its attendee limit");
            }

            ParticipantEvent participantEvent = new ParticipantEvent(eventParticipant, event);
            participantEventRepository.save(participantEvent);

            log.info("Successfully joined event with ID: {}", eventId);
        } catch (Exception e) {
            log.error("Error while joining event with ID: {}: {}", eventId, e.getMessage());
            throw new RuntimeException("Error while joining event: " + e.getMessage());
        }
    }

}
