package com.app.attendify.eventOrganizer.services;

import com.app.attendify.company.model.Company;
import com.app.attendify.event.dto.*;
import com.app.attendify.event.model.AgendaItem;
import com.app.attendify.event.services.StatisticsService;
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
import com.app.attendify.eventParticipant.dto.EventParticipantDTO;
import com.app.attendify.eventParticipant.dto.ParticipantDTO;
import com.app.attendify.eventParticipant.enums.EducationLevel;
import com.app.attendify.eventParticipant.enums.Gender;
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
import java.util.*;
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
    private final StatisticsService statisticsService;

    public EventOrganizerService(EventOrganizerRepository eventOrganizerRepository, EventRepository eventRepository, UserRepository userRepository, EventAttendanceRepository eventAttendanceRepository, EventValidation eventValidation, TimeZoneConversionUtil timeZoneConversionUtil, EventFilterUtil eventFilterUtil, StatisticsService statisticsService) {
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.eventAttendanceRepository = eventAttendanceRepository;
        this.eventValidation = eventValidation;
        this.timeZoneConversionUtil = timeZoneConversionUtil;
        this.eventFilterUtil = eventFilterUtil;
        this.statisticsService = statisticsService;
    }

    public Map<Integer, Map<Gender, Long>> getGenderStatistics() {
        List<Object[]> results = eventAttendanceRepository.countParticipantsByGender();
        Map<Integer, Map<Gender, Long>> statistics = new HashMap<>();

        for (Object[] result : results) {
            Integer eventId = (Integer) result[0];
            Gender gender = (Gender) result[1];
            Long count = (Long) result[2];

            statistics.computeIfAbsent(eventId, k -> new HashMap<>()).put(gender, count);
        }

        return statistics;
    }

    public Event createEvent(CreateEventRequest request) {
        try {
            Optional<EventOrganizer> optionalOrganizer = eventOrganizerRepository.findById(request.getOrganizerId());
            if (optionalOrganizer.isEmpty()) {
                logger.error("Organizer not found for ID: {}", request.getOrganizerId());
                throw new IllegalArgumentException("Organizer not found");
            }
            EventOrganizer organizer = optionalOrganizer.get();

            LocalDateTime eventDateInBelgrade = timeZoneConversionUtil.convertToBelgradeTime(request.getEventStartDate());
            LocalDateTime eventEndDateInBelgrade = timeZoneConversionUtil.convertToBelgradeTime(request.getEventEndDate());
            LocalDateTime joinDeadlineInBelgrade = request.getJoinDeadline() != null ? timeZoneConversionUtil.convertToBelgradeTime(request.getJoinDeadline()) : null;

            Event event = new Event().setName(request.getName()).setDescription(request.getDescription()).setCompany(organizer.getCompany()).setOrganizer(organizer).setLocation(request.getLocation()).setAttendeeLimit(request.getAttendeeLimit()).setEventStartDate(eventDateInBelgrade).setEventEndDate(eventEndDateInBelgrade).setJoinDeadline(joinDeadlineInBelgrade).setJoinApproval(request.isJoinApproval());

            List<AgendaItem> agendaItems = new ArrayList<>();
            for (AgendaItemRequest agendaRequest : request.getAgendaItems()) {
                if (agendaRequest.getTitle() == null || agendaRequest.getTitle().trim().isEmpty() ||
                        agendaRequest.getDescription() == null || agendaRequest.getDescription().trim().isEmpty()) {
                    logger.error("Agenda item missing title or description");
                    throw new IllegalArgumentException("Each agenda item must have a title and description");
                }

                LocalDateTime agendaStartTime = timeZoneConversionUtil.convertToBelgradeTime(agendaRequest.getStartTime());
                LocalDateTime agendaEndTime = timeZoneConversionUtil.convertToBelgradeTime(agendaRequest.getEndTime());

                AgendaItem agendaItem = new AgendaItem().setTitle(agendaRequest.getTitle())
                        .setDescription(agendaRequest.getDescription())
                        .setStartTime(agendaStartTime)
                        .setEndTime(agendaEndTime)
                        .setEvent(event);

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

            LocalDateTime eventLocalDateTime = timeZoneConversionUtil.convertToBelgradeTime(request.getEventStartDate());
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

            event.setName(request.getName()).setDescription(request.getDescription()).setLocation(request.getLocation()).setAttendeeLimit(attendeeLimit).setEventStartDate(eventLocalDateTime).setEventEndDate(eventEndDateLocalDateTime).setJoinDeadline(request.getJoinDeadline()).setJoinApproval(request.isJoinApproval());

            return eventRepository.save(event);
        } catch (Exception e) {
            logger.error("Error updating event", e);
            throw new RuntimeException("Error updating event", e);
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
    public EventFilterSummaryForOrganizerDTO getEventsByOrganizer(String filterType) {
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
                List<AgendaItemDTO> agendaItems = event.getAgendaItems().stream().map(agendaItem -> new AgendaItemDTO(agendaItem.getId(), agendaItem.getTitle(), agendaItem.getDescription(), agendaItem.getStartTime(), agendaItem.getEndTime())).collect(Collectors.toList());

                List<EventAttendance> acceptedAttendances = event.getEventAttendances().stream().filter(attendance -> attendance.getStatus() == AttendanceStatus.ACCEPTED).toList();

                return new EventForOrganizersDTO(event.getId(), event.getName(), event.getDescription(), event.getLocation(), event.getCompany() != null ? event.getCompany().getName() : "No company", event.getOrganizer() != null && event.getOrganizer().getUser() != null ? event.getOrganizer().getUser().getFullName() : "No organizer", event.getAvailableSlots(), event.getEventStartDate(), event.getAttendeeLimit(), event.getJoinDeadline(), (int) acceptedAttendances.size(), event.isJoinApproval(), event.getEventEndDate(), agendaItems, event.getPendingRequests());
            }).collect(Collectors.toList());

            int thisWeekCount = eventFilterUtil.filterEventsByCurrentWeekForOrganizer(eventForOrganizersDTOS).size();
            int thisMonthCount = eventFilterUtil.filterEventsByCurrentMonthForOrganizer(eventForOrganizersDTOS).size();
            int allEventsCount = eventForOrganizersDTOS.size();

            int thisWeekParticipants = eventForOrganizersDTOS.stream().filter(event -> eventFilterUtil.filterEventsByCurrentWeekForOrganizer(List.of(event)).contains(event)).mapToInt(EventForOrganizersDTO::getAcceptedParticipants).sum();

            int thisMonthParticipants = eventForOrganizersDTOS.stream().filter(event -> eventFilterUtil.filterEventsByCurrentMonthForOrganizer(List.of(event)).contains(event)).mapToInt(EventForOrganizersDTO::getAcceptedParticipants).sum();

            int allEventsParticipants = eventForOrganizersDTOS.stream().mapToInt(EventForOrganizersDTO::getAcceptedParticipants).sum();

            if ("week".equalsIgnoreCase(filterType)) {
                eventForOrganizersDTOS = eventFilterUtil.filterEventsByCurrentWeekForOrganizer(eventForOrganizersDTOS);
            } else if ("month".equalsIgnoreCase(filterType)) {
                eventForOrganizersDTOS = eventFilterUtil.filterEventsByCurrentMonthForOrganizer(eventForOrganizersDTOS);
            }

            logger.info("Found {} events for organizer: {}", eventForOrganizersDTOS.size(), email);

            return new EventFilterSummaryForOrganizerDTO(eventForOrganizersDTOS, thisWeekCount, thisMonthCount, allEventsCount, thisWeekParticipants, thisMonthParticipants, allEventsParticipants);

        } catch (Exception e) {
            logger.error("Error fetching events for organizer", e);
            throw new RuntimeException("Error fetching events for organizer", e);
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

    @Transactional
    public List<EventParticipantDTO> getParticipantsByCompany() {
        try {
            UserDetails currentUser = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String email = currentUser.getUsername();

            User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found for email: " + email));

            EventOrganizer organizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new IllegalArgumentException("Organizer not found for user: " + email));

            Company company = organizer.getCompany();
            if (company == null) {
                throw new IllegalArgumentException("Organizer does not have an associated company.");
            }

            List<EventParticipant> participants = company.getParticipants();

            return participants.stream().map(participant -> {
                List<String> eventLinks = participant.getParticipantEvents().stream().filter(attendance -> attendance.getStatus() == AttendanceStatus.ACCEPTED).map(attendance -> "/event-details/" + attendance.getEvent().getId()).collect(Collectors.toList());

                Integer joinedEventCount = eventLinks.size();

                return new EventParticipantDTO(participant.getId(), participant.getUser().getFullName(), participant.getUser().getEmail(), company.getName(), joinedEventCount, eventLinks);
            }).collect(Collectors.toList());

        } catch (Exception e) {
            logger.error("Error retrieving participants for organizer's company", e);
            throw new RuntimeException("Error retrieving participants for organizer's company", e);
        }
    }

    public EventDetailDTO getEventDetails(int eventId) {
        try {
            Event event = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));

            List<ParticipantDTO> participants = event.getEventAttendances().stream().map(eventAttendance -> {
                EventParticipant participant = eventAttendance.getParticipant();
                return new ParticipantDTO(participant.getId(), participant.getUser().getFullName(), participant.getUser().getEmail());
            }).collect(Collectors.toList());

            String attendeeLimit = (event.getAttendeeLimit() == null) ? "No Limit" : String.valueOf(event.getAttendeeLimit());

            return new EventDetailDTO(event.getId(), event.getName(), event.getDescription(), event.getLocation(), event.getEventStartDate(), event.getEventEndDate(), event.getOrganizer().getUser().getFullName(), attendeeLimit, participants);
        } catch (Exception e) {
            logger.error("Error retrieving event details", e);
            throw new RuntimeException("Error retrieving event details", e);
        }
    }

    @Transactional
    public EventStatisticsDTO getEventStatistics(Integer eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(() -> new IllegalArgumentException("Event not found"));

        List<EventAttendance> acceptedAttendances = event.getEventAttendances().stream().filter(attendance -> attendance.getStatus() == AttendanceStatus.ACCEPTED).toList();

        Map<String, Object> ageStats = statisticsService.calculateAgeStats(acceptedAttendances.stream().map(attendance -> attendance.getParticipant().getAge()).toList());

        Map<String, Long> genderCounts = statisticsService.calculateGenderCounts(acceptedAttendances);

        Map<String, Object> experienceStats = statisticsService.calculateExperienceStats(acceptedAttendances.stream().map(attendance -> attendance.getParticipant().getYearsOfExperience()).toList());

        Map<String, Map<String, Object>> educationLevelStats = statisticsService.calculateEducationLevelStats(acceptedAttendances);
        Map<String, EducationLevelStatsDTO> educationLevelDTOMap = educationLevelStats.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, entry -> new EducationLevelStatsDTO((Long) entry.getValue().get("count"), (Double) entry.getValue().get("percentage"))));

        Map<String, Map<String, Object>> occupationStats = statisticsService.calculateOccupationStats(acceptedAttendances);
        Map<String, OccupationStatsDTO> occupationDTOMap = occupationStats.entrySet().stream().collect(Collectors.toMap(Map.Entry::getKey, entry -> new OccupationStatsDTO((Long) entry.getValue().get("count"), (Double) entry.getValue().get("percentage"))));

        return new EventStatisticsDTO((Double) ageStats.get("averageAge"), (Integer) ageStats.get("highestAge"), (Integer) ageStats.get("lowestAge"), genderCounts.get("maleCount"), genderCounts.get("femaleCount"), genderCounts.get("otherCount"), (Double) experienceStats.get("averageExperience"), (Integer) experienceStats.get("highestExperience"), (Integer) experienceStats.get("lowestExperience"), educationLevelDTOMap, occupationDTOMap);
    }
}
