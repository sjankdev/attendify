package com.app.attendify.eventParticipant.service;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Department;
import com.app.attendify.event.dto.AgendaItemDTO;
import com.app.attendify.event.dto.EventFilterSummaryForParticipantDTO;
import com.app.attendify.event.dto.FeedbackDTO;
import com.app.attendify.event.enums.AttendanceStatus;
import com.app.attendify.event.model.Event;
import com.app.attendify.event.model.EventAttendance;
import com.app.attendify.event.model.Feedback;
import com.app.attendify.event.repository.EventRepository;
import com.app.attendify.event.repository.EventAttendanceRepository;
import com.app.attendify.event.repository.FeedbackRepository;
import com.app.attendify.eventParticipant.dto.EventForParticipantsDTO;
import com.app.attendify.eventParticipant.model.EventParticipant;
import com.app.attendify.eventParticipant.repository.EventParticipantRepository;
import com.app.attendify.utils.EventFilterUtil;
import jakarta.transaction.Transactional;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EventParticipantService {

    private static final Logger log = LoggerFactory.getLogger(EventParticipantService.class);

    private final EventParticipantRepository eventParticipantRepository;
    private final EventRepository eventRepository;
    private final EventAttendanceRepository eventAttendanceRepository;
    private final EventFilterUtil eventFilterUtil;
    private final FeedbackRepository feedbackRepository;

    public EventParticipantService(EventParticipantRepository eventParticipantRepository, EventRepository eventRepository, EventAttendanceRepository eventAttendanceRepository, EventFilterUtil eventFilterUtil, FeedbackRepository feedbackRepository) {
        this.eventParticipantRepository = eventParticipantRepository;
        this.eventRepository = eventRepository;
        this.eventAttendanceRepository = eventAttendanceRepository;
        this.eventFilterUtil = eventFilterUtil;
        this.feedbackRepository = feedbackRepository;
    }

    @Transactional
    public EventFilterSummaryForParticipantDTO getEventsForParticipant(String currentUserEmail, String filterType) {
        try {
            EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(currentUserEmail).orElseThrow(() -> new RuntimeException("Event Participant not found for the current user"));

            Company participantCompany = eventParticipant.getCompany();
            if (participantCompany == null) {
                throw new RuntimeException("The participant does not belong to any company.");
            }

            Department participantDepartment = eventParticipant.getDepartment();
            List<Event> events = eventRepository.findByCompany(participantCompany);

            events = events.stream().filter(event -> event.isAvailableForAllDepartments() || event.getDepartments().contains(participantDepartment)).collect(Collectors.toList());

            List<EventForParticipantsDTO> eventForParticipantsDTOS = events.stream().map(event -> {
                EventAttendance attendance = eventAttendanceRepository.findByParticipantIdAndEventId(eventParticipant.getId(), event.getId()).orElse(null);
                String status = attendance != null ? attendance.getStatus().name() : "NOT_JOINED";

                Integer availableSeats = event.getAvailableSlots();
                Integer attendeeLimit = event.getAttendeeLimit();

                long acceptedParticipantsCount = event.getEventAttendances().stream().filter(attendance1 -> attendance1.getStatus() == AttendanceStatus.ACCEPTED).count();

                Integer pendingRequests = event.getPendingRequests();

                List<String> departmentNames;
                if (event.isAvailableForAllDepartments()) {
                    departmentNames = List.of("All");
                } else {
                    departmentNames = event.getDepartments().stream().map(Department::getName).collect(Collectors.toList());
                }

                List<AgendaItemDTO> agendaItems = event.getAgendaItems().stream().map(agendaItem -> new AgendaItemDTO(agendaItem.getId(), agendaItem.getTitle(), agendaItem.getDescription(), agendaItem.getStartTime(), agendaItem.getEndTime())).collect(Collectors.toList());

                boolean isFeedbackSubmitted = feedbackRepository.existsByEventIdAndParticipantId(event.getId(), eventParticipant.getId());

                FeedbackDTO feedbackDTO = null;
                if (feedbackRepository.existsByEventIdAndParticipantId(event.getId(), eventParticipant.getId())) {
                    feedbackDTO = getFeedbackForEvent(event.getId(), currentUserEmail);
                }

                return new EventForParticipantsDTO(event.getId(), event.getName(), event.getDescription(), event.getLocation(), event.getCompany() != null ? event.getCompany().getName() : "No company", event.getOrganizer() != null && event.getOrganizer().getUser() != null ? event.getOrganizer().getUser().getFullName() : "No organizer", availableSeats, event.getEventStartDate(), attendeeLimit, event.getJoinDeadline(), (int) acceptedParticipantsCount, event.isJoinApproval(), status, event.getEventEndDate(), agendaItems, pendingRequests, departmentNames, isFeedbackSubmitted, event.getEventEndDate().isBefore(LocalDateTime.now()), feedbackDTO);
            }).collect(Collectors.toList());

            int thisWeekCount = eventFilterUtil.filterEventsByCurrentWeekForParticipant(eventForParticipantsDTOS).size();
            int thisMonthCount = eventFilterUtil.filterEventsByCurrentMonthForParticipant(eventForParticipantsDTOS).size();
            int allEventsCount = eventForParticipantsDTOS.size();
            int upcomingEventsCount = eventFilterUtil.filterUpcomingEventsForParticipant(eventForParticipantsDTOS).size();

            if ("week".equalsIgnoreCase(filterType)) {
                eventForParticipantsDTOS = eventFilterUtil.filterEventsByCurrentWeekForParticipant(eventForParticipantsDTOS);
            } else if ("month".equalsIgnoreCase(filterType)) {
                eventForParticipantsDTOS = eventFilterUtil.filterEventsByCurrentMonthForParticipant(eventForParticipantsDTOS);
            } else if ("upcoming".equalsIgnoreCase(filterType)) {
                eventForParticipantsDTOS = eventFilterUtil.filterUpcomingEventsForParticipant(eventForParticipantsDTOS);
            }

            return new EventFilterSummaryForParticipantDTO(eventForParticipantsDTOS, thisWeekCount, thisMonthCount, allEventsCount, upcomingEventsCount);

        } catch (Exception e) {
            log.error("Error fetching events for participant", e);
            throw new RuntimeException("Error fetching events for participant", e);
        }
    }

    @Transactional
    public void joinEvent(int eventId, String userEmail) {
        log.info("Received request to join event with ID: {}", eventId);

        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
        EventParticipant eventParticipant = eventParticipantRepository.findByUser_Email(userEmail).orElseThrow(() -> new RuntimeException("Participant not found"));

        if (event.getAttendeeLimit() != null && event.getAvailableSlots() <= 0) {
            throw new RuntimeException("This event has reached its attendee limit.");
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

        Event event = eventRepository.findById(eventId).orElseThrow(() -> {
            log.error("No event found with ID: {}", eventId);
            return new RuntimeException("Event not found.");
        });

        if (event.getEventEndDate().isBefore(LocalDateTime.now())) {
            log.warn("Event end date has passed. Cannot unjoin.");
            throw new RuntimeException("You cannot unjoin this event as the end date has passed.");
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

    @Transactional
    public void submitFeedback(Integer eventId, String userEmail, String comments, int rating) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));

        if (LocalDateTime.now().isBefore(event.getEventEndDate())) {
            throw new RuntimeException("Feedback can only be submitted after the event has ended.");
        }

        EventParticipant participant = eventParticipantRepository.findByUser_Email(userEmail).orElseThrow(() -> new RuntimeException("Participant not found"));

        if (eventAttendanceRepository.findByParticipantIdAndEventId(participant.getId(), eventId).isEmpty()) {
            throw new RuntimeException("You did not attend this event.");
        }

        Feedback feedback = new Feedback();
        feedback.setEvent(event);
        feedback.setParticipant(participant);
        feedback.setComments(comments);
        feedback.setRating(rating);

        feedbackRepository.save(feedback);

        event.setFeedbackSubmitted(true);
        eventRepository.save(event);
    }

    @Transactional
    public FeedbackDTO getFeedbackForEvent(Integer eventId, String userEmail) {
        EventParticipant participant = eventParticipantRepository.findByUser_Email(userEmail).orElseThrow(() -> new RuntimeException("Participant not found"));

        Feedback feedback = feedbackRepository.findByEventIdAndParticipantId(eventId, participant.getId()).orElse(null);

        if (feedback == null) {
            return null;
        }

        FeedbackDTO feedbackDTO = new FeedbackDTO();
        feedbackDTO.setComments(feedback.getComments());
        feedbackDTO.setRating(feedback.getRating());

        return feedbackDTO;
    }

}
