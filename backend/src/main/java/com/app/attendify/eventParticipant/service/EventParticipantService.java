package com.app.attendify.eventParticipant.service;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.event.dto.AgendaItemDTO;
import com.app.attendify.event.enums.AttendanceStatus;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.model.EventAttendance;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.event.repository.EventAttendanceRepository;
import com.app.attendify.eventParticipant.dto.EventForParticipantsDTO;
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

import java.time.LocalDateTime;
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
    private final EventAttendanceRepository eventAttendanceRepository;

    @Autowired
    public EventParticipantService(UserRepository userRepository, RoleRepository roleRepository, EventParticipantRepository eventParticipantRepository, InvitationService invitationService, PasswordEncoder passwordEncoder, EventRepository eventRepository, EventAttendanceRepository eventAttendanceRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.eventParticipantRepository = eventParticipantRepository;
        this.invitationService = invitationService;
        this.passwordEncoder = passwordEncoder;
        this.eventRepository = eventRepository;
        this.eventAttendanceRepository = eventAttendanceRepository;
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
    public List<EventForParticipantsDTO> getEventsForCurrentParticipant(String currentUserEmail) {
        EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(currentUserEmail).orElseThrow(() -> new RuntimeException("Event Participant not found for the current user"));

        Company participantCompany = eventParticipant.getCompany();
        if (participantCompany == null) {
            throw new RuntimeException("The participant does not belong to any company.");
        }

        List<Event> events = eventRepository.findByCompany(participantCompany);

        return events.stream().map(event -> {
            EventAttendance attendance = eventAttendanceRepository.findByParticipantIdAndEventId(eventParticipant.getId(), event.getId()).orElse(null);
            String status = attendance != null ? attendance.getStatus().name() : "NOT_JOINED";

            Integer availableSeats = event.getAvailableSlots();
            Integer attendeeLimit = event.getAttendeeLimit();
            Integer joinedParticipants = event.getParticipantEvents().size();

            List<AgendaItemDTO> agendaItems = event.getAgendaItems().stream().map(agendaItem -> new AgendaItemDTO(agendaItem.getId(), agendaItem.getTitle(), agendaItem.getDescription(), agendaItem.getStartTime(), agendaItem.getEndTime())).collect(Collectors.toList());

            return new EventForParticipantsDTO(event.getId(), event.getName(), event.getDescription(), event.getLocation(), event.getCompany() != null ? event.getCompany().getName() : "No company", event.getOrganizer() != null && event.getOrganizer().getUser() != null ? event.getOrganizer().getUser().getFullName() : "No organizer", availableSeats, event.getEventDate(), attendeeLimit, event.getJoinDeadline(), joinedParticipants, event.isJoinApproval(), status, event.getEventEndDate(), agendaItems);
        }).collect(Collectors.toList());
    }


    @Transactional
    public void joinEvent(int eventId, String userEmail) {
        log.info("Received request to join event with ID: {}", eventId);

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(userEmail).orElseThrow(() -> new RuntimeException("Participant not found"));

        if (event.getAttendeeLimit() != null && event.getAvailableSlots() <= 0) {
            throw new RuntimeException("This event has reached its attendee limit");
        }

        if (eventAttendanceRepository.existsByParticipantIdAndEventId(eventParticipant.getId(), eventId)) {
            throw new RuntimeException("You have already joined this event");
        }

        if (event.getJoinDeadline() != null && LocalDateTime.now().isAfter(event.getJoinDeadline())) {
            throw new RuntimeException("The join deadline for this event has passed.");
        }

        AttendanceStatus status = event.isJoinApproval() ? AttendanceStatus.PENDING : AttendanceStatus.ACCEPTED;

        EventAttendance eventAttendance = new EventAttendance(eventParticipant, event);
        eventAttendance.setStatus(status);
        eventAttendanceRepository.save(eventAttendance);

        log.info("Successfully {}joined event with ID: {}", status == AttendanceStatus.ACCEPTED ? "" : "requested to ", eventId);
    }


    @Transactional
    public void unjoinEvent(Integer eventId, String userEmail) {
        log.info("Attempting to unjoin event. User email: {}, Event ID: {}", userEmail, eventId);

        EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(userEmail).orElseThrow(() -> {
            log.error("No EventParticipant found for user email: {}", userEmail);
            return new RuntimeException("Participant not found for the current user");
        });

        log.info("Participant found: {} (ID: {})", eventParticipant.getUser().getFullName(), eventParticipant.getId());

        boolean isJoined = eventAttendanceRepository.existsByParticipantIdAndEventId(eventParticipant.getId(), eventId);
        if (!isJoined) {
            log.warn("Participant with ID {} is not joined to event ID {}", eventParticipant.getId(), eventId);
            throw new RuntimeException("You are not joined to this event.");
        }

        log.info("Participant with ID {} is confirmed to be joined to event ID {}", eventParticipant.getId(), eventId);

        eventAttendanceRepository.deleteByParticipantIdAndEventId(eventParticipant.getId(), eventId);

        boolean stillExists = eventAttendanceRepository.existsByParticipantIdAndEventId(eventParticipant.getId(), eventId);
        if (stillExists) {
            log.error("Failed to delete association between Participant ID {} and Event ID {}", eventParticipant.getId(), eventId);
            throw new RuntimeException("Failed to unjoin the event. Please try again.");
        }

        log.info("Successfully removed association between Participant ID {} and Event ID {}", eventParticipant.getId(), eventId);
    }

}
