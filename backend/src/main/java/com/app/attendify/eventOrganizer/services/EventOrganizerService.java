package com.app.attendify.eventOrganizer.services;

import com.app.attendify.event.dto.*;
import com.app.attendify.event.model.AgendaItem;
import com.app.attendify.event.validation.EventValidation;
import com.app.attendify.eventOrganizer.dto.EventForOrganizersDTO;
import com.app.attendify.event.enums.AttendanceStatus;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.model.EventAttendance;
import com.app.attendify.event.repository.EventAttendanceRepository;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.eventOrganizer.repository.EventOrganizerRepository;
import com.app.attendify.eventParticipant.dto.EventAttendanceDTO;
import com.app.attendify.eventParticipant.model.EventParticipant;
import com.app.attendify.security.model.User;
import com.app.attendify.security.repositories.UserRepository;
import com.app.attendify.utils.EventFilterUtil;
import com.app.attendify.utils.TimeZoneConversionUtil;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventOrganizerService {

    private static final Logger logger = LoggerFactory.getLogger(EventOrganizerService.class);

    private final EventOrganizerRepository eventOrganizerRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventAttendanceRepository eventAttendanceRepository;
    private final EventValidation eventValidation;
    private final TimeZoneConversionUtil timeZoneConversionUtil;
    private final EventFilterUtil eventFilterUtil;

    public EventOrganizerService(EventFilterUtil eventFilterUtil, TimeZoneConversionUtil timeZoneConversionUtil, EventValidation eventValidation, EventAttendanceRepository eventAttendanceRepository, UserRepository userRepository, EventRepository eventRepository, EventOrganizerRepository eventOrganizerRepository) {
        this.eventFilterUtil = eventFilterUtil;
        this.timeZoneConversionUtil = timeZoneConversionUtil;
        this.eventValidation = eventValidation;
        this.eventAttendanceRepository = eventAttendanceRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.eventOrganizerRepository = eventOrganizerRepository;
    }

    public Event createEvent(CreateEventRequest request) {
        try {
            Optional<EventOrganizer> optionalOrganizer = eventOrganizerRepository.findById(request.getOrganizerId());
            if (optionalOrganizer.isEmpty()) {
                logger.error("Organizer not found for ID: {}", request.getOrganizerId());
                throw new IllegalArgumentException("Organizer not found");
            }
            EventOrganizer organizer = optionalOrganizer.get();

            LocalDateTime eventDateInBelgrade = timeZoneConversionUtil.convertToBelgradeTime(request.getEventDate());
            LocalDateTime eventEndDateInBelgrade = timeZoneConversionUtil.convertToBelgradeTime(request.getEventEndDate());
            LocalDateTime joinDeadlineInBelgrade = request.getJoinDeadline() != null ? timeZoneConversionUtil.convertToBelgradeTime(request.getJoinDeadline()) : null;

            Event event = new Event().setName(request.getName()).setDescription(request.getDescription()).setCompany(organizer.getCompany()).setOrganizer(organizer).setLocation(request.getLocation()).setAttendeeLimit(request.getAttendeeLimit()).setEventDate(eventDateInBelgrade).setEventEndDate(eventEndDateInBelgrade).setJoinDeadline(joinDeadlineInBelgrade).setJoinApproval(request.isJoinApproval());

            List<AgendaItem> agendaItems = new ArrayList<>();
            for (AgendaItemRequest agendaRequest : request.getAgendaItems()) {
                LocalDateTime agendaStartTime = timeZoneConversionUtil.convertToBelgradeTime(agendaRequest.getStartTime());
                LocalDateTime agendaEndTime = timeZoneConversionUtil.convertToBelgradeTime(agendaRequest.getEndTime());

                AgendaItem agendaItem = new AgendaItem().setTitle(agendaRequest.getTitle()).setDescription(agendaRequest.getDescription()).setStartTime(agendaStartTime).setEndTime(agendaEndTime).setEvent(event);

                agendaItems.add(agendaItem);
            }

            event.setAgendaItems(agendaItems);

            eventValidation.validateEventBeforeCreate(request);

            return eventRepository.save(event);
        } catch (Exception e) {
            logger.error("Error creating event", e);
            throw new RuntimeException("Error creating event", e);
        }
    }

    @Transactional
    public Event updateEvent(int eventId, UpdateEventRequest request) {
        try {
            eventValidation.validateEventDatesBeforeUpdate(request);

            Event event = eventRepository.findById(eventId).orElseThrow(() -> {
                logger.error("Event not found for ID: {}", eventId);
                return new IllegalArgumentException("Event not found");
            });

            UserDetails currentUser = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = currentUser.getUsername();
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("User not found for email: {}", email);
                return new IllegalArgumentException("User not found");
            });

            EventOrganizer organizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> {
                logger.error("Event organizer not found for user: {}", email);
                return new IllegalArgumentException("Organizer not found");
            });

            if (!event.getOrganizer().equals(organizer)) {
                throw new IllegalArgumentException("Event does not belong to the current organizer");
            }

            int currentJoinedParticipants = event.getParticipantEvents().size();
            if (request.getAttendeeLimit() != null && request.getAttendeeLimit() < currentJoinedParticipants) {
                throw new IllegalArgumentException("Attendee limit cannot be lower than the current number of joined participants");
            }

            LocalDateTime eventLocalDateTime = timeZoneConversionUtil.convertToBelgradeTime(request.getEventDate());
            LocalDateTime eventEndDateLocalDateTime = timeZoneConversionUtil.convertToBelgradeTime(request.getEventEndDate());

            List<AgendaItemUpdateRequest> agendaItemRequests = request.getAgendaItems();
            if (agendaItemRequests != null) {
                Map<Integer, AgendaItem> existingAgendaItems = event.getAgendaItems().stream().collect(Collectors.toMap(AgendaItem::getId, item -> item));

                List<AgendaItem> updatedAgendaItems = new ArrayList<>();

                for (AgendaItemUpdateRequest agendaItemRequest : agendaItemRequests) {
                    AgendaItem agendaItem;
                    if (agendaItemRequest.getId() != null && existingAgendaItems.containsKey(agendaItemRequest.getId())) {
                        agendaItem = existingAgendaItems.get(agendaItemRequest.getId());
                    } else {
                        agendaItem = new AgendaItem();
                        agendaItem.setEvent(event);
                    }

                    agendaItem.setTitle(agendaItemRequest.getTitle()).setDescription(agendaItemRequest.getDescription()).setStartTime(agendaItemRequest.getStartTime()).setEndTime(agendaItemRequest.getEndTime());
                    updatedAgendaItems.add(agendaItem);
                }

                event.getAgendaItems().removeIf(item -> !updatedAgendaItems.contains(item));
                event.getAgendaItems().clear();
                event.getAgendaItems().addAll(updatedAgendaItems);
            }

            Integer attendeeLimit = request.getAttendeeLimit();
            if (attendeeLimit == null) {
                attendeeLimit = null;
            }

            event.setName(request.getName()).setDescription(request.getDescription()).setLocation(request.getLocation()).setAttendeeLimit(attendeeLimit).setEventDate(eventLocalDateTime).setEventEndDate(eventEndDateLocalDateTime).setJoinDeadline(request.getJoinDeadline()).setJoinApproval(request.isJoinApproval());

            return eventRepository.save(event);
        } catch (Exception e) {
            logger.error("Error updating event", e);
            throw new RuntimeException("Error updating event", e);
        }
    }

    @Transactional
    public List<EventForOrganizersDTO> getEventsByOrganizer(String filterType) {
        try {
            UserDetails currentUser = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = currentUser.getUsername();
            logger.info("Fetching events for organizer: {}", email);

            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("User not found for email: {}", email);
                return new IllegalArgumentException("User not found");
            });

            EventOrganizer organizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> {
                logger.error("Event organizer not found for user: {}", email);
                return new IllegalArgumentException("Organizer not found");
            });

            List<EventForOrganizersDTO> eventForOrganizersDTOS = organizer.getEvents().stream().map(event -> {
                Integer availableSeats = event.getAvailableSlots();
                Integer attendeeLimit = event.getAttendeeLimit();
                LocalDateTime joinDeadline = event.getJoinDeadline();

                List<AgendaItemDTO> agendaItems = event.getAgendaItems().stream().map(agendaItem ->
                        new AgendaItemDTO(
                                agendaItem.getId(),
                                agendaItem.getTitle(),
                                agendaItem.getDescription(),
                                agendaItem.getStartTime(),
                                agendaItem.getEndTime()
                        )
                ).collect(Collectors.toList());

                return new EventForOrganizersDTO(
                        event.getId(),
                        event.getName(),
                        event.getDescription(),
                        event.getLocation(),
                        event.getCompany() != null ? event.getCompany().getName() : "No company",
                        event.getOrganizer() != null && event.getOrganizer().getUser() != null ? event.getOrganizer().getUser().getFullName() : "No organizer",
                        availableSeats,
                        event.getEventDate(),
                        attendeeLimit,
                        joinDeadline,
                        event.getParticipantEvents().size(),
                        event.isJoinApproval(),
                        event.getEventEndDate(),
                        agendaItems
                );
            }).collect(Collectors.toList());

            if ("week".equalsIgnoreCase(filterType)) {
                eventForOrganizersDTOS = eventFilterUtil.filterEventsByCurrentWeek(eventForOrganizersDTOS);
            } else if ("month".equalsIgnoreCase(filterType)) {
                eventForOrganizersDTOS = eventFilterUtil.filterEventsByCurrentMonth(eventForOrganizersDTOS);
            }

            logger.info("Found {} events for organizer: {}", eventForOrganizersDTOS.size(), email);
            return eventForOrganizersDTOS;
        } catch (Exception e) {
            logger.error("Error fetching events for organizer", e);
            throw new RuntimeException("Error fetching events for organizer", e);
        }
    }

    @Transactional
    public void deleteEvent(int eventId) {
        try {
            UserDetails currentUser = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = currentUser.getUsername();
            logger.info("Deleting event for organizer: {}", email);

            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("User not found for email: {}", email);
                return new IllegalArgumentException("User not found");
            });

            EventOrganizer organizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> {
                logger.error("Event organizer not found for user: {}", email);
                return new IllegalArgumentException("Organizer not found");
            });

            Event event = eventRepository.findById(eventId).orElseThrow(() -> {
                logger.error("Event not found for ID: {}", eventId);
                return new IllegalArgumentException("Event not found");
            });

            if (!event.getOrganizer().equals(organizer)) {
                throw new IllegalArgumentException("Event does not belong to the current organizer");
            }

            eventRepository.delete(event);
            logger.info("Event with ID: {} deleted successfully", eventId);
        } catch (Exception e) {
            logger.error("Error deleting event", e);
            throw new RuntimeException("Error deleting event", e);
        }
    }

    @Transactional
    public List<EventAttendanceDTO> getParticipantsByEvent(int eventId) {
        try {
            Event event = eventRepository.findById(eventId).orElseThrow(() -> {
                logger.error("Event not found for ID: {}", eventId);
                return new IllegalArgumentException("Event not found");
            });

            UserDetails currentUser = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = currentUser.getUsername();
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                logger.error("User not found for email: {}", email);
                return new IllegalArgumentException("User not found");
            });

            EventOrganizer organizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> {
                logger.error("Event organizer not found for user: {}", email);
                return new IllegalArgumentException("Organizer not found");
            });

            if (!event.getOrganizer().equals(organizer)) {
                throw new IllegalArgumentException("Event does not belong to the current organizer");
            }

            return event.getParticipantEvents().stream().map(participantEvent -> {
                EventParticipant participant = participantEvent.getParticipant();
                int participantId = participant.getId();
                String participantName = participant.getUser().getFullName();
                String participantEmail = participant.getUser().getEmail();
                AttendanceStatus status = participantEvent.getStatus();

                logger.info("Participant details - ID: {}, Name: {}, Email: {}, Status: {}", participantId, participantName, participantEmail, status);

                return new EventAttendanceDTO(participantName, participantEmail, participantId, status);
            }).collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error retrieving participants for event", e);
            throw new RuntimeException("Error retrieving participants for event", e);
        }
    }

    @Transactional
    public void reviewJoinRequest(int eventId, int participantId, AttendanceStatus newStatus) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if (!event.isJoinApproval()) {
            throw new RuntimeException("Join requests do not require approval for this event");
        }

        EventAttendance attendance = eventAttendanceRepository.findByParticipantIdAndEventId(participantId, eventId).orElseThrow(() -> new RuntimeException("No join request found for this participant and event"));

        if (newStatus == AttendanceStatus.ACCEPTED && event.getAttendeeLimit() != null && event.getAvailableSlots() <= 0) {
            throw new RuntimeException("Event has no available slots");
        }

        attendance.setStatus(newStatus);
        eventAttendanceRepository.save(attendance);

        logger.info("Updated join request to status: {}", newStatus);
    }

    public Integer getAvailableSlotsForEvent(int eventId) {
        try {
            Event event = eventRepository.findById(eventId).orElseThrow(() -> {
                logger.error("Event not found for ID: {}", eventId);
                return new IllegalArgumentException("Event not found");
            });

            return event.getAvailableSlots();
        } catch (Exception e) {
            logger.error("Error calculating available slots for event", e);
            throw new RuntimeException("Error calculating available slots for event", e);
        }
    }


}
