package com.app.attendify.event.validation;

import com.app.attendify.event.dto.AgendaItemRequest;
import com.app.attendify.event.dto.AgendaItemUpdateRequest;
import com.app.attendify.event.dto.CreateEventRequest;
import com.app.attendify.event.dto.UpdateEventRequest;
import com.app.attendify.utils.TimeZoneConversionUtil;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class EventValidation {

    private final TimeZoneConversionUtil timeZoneConversionUtil;

    public EventValidation(TimeZoneConversionUtil timeZoneConversionUtil) {
        this.timeZoneConversionUtil = timeZoneConversionUtil;
    }

    public void validateEventBeforeCreate(CreateEventRequest request) {
        if (request.getEventDate().isAfter(request.getEventEndDate())) {
            throw new IllegalArgumentException("Event start date must be before end date.");
        }

        if (request.getJoinDeadline() != null && request.getJoinDeadline().isAfter(request.getEventDate())) {
            throw new IllegalArgumentException("Join deadline must be before the event start date.");
        }

        if (request.getAttendeeLimit() != null && request.getAttendeeLimit() < 1) {
            throw new IllegalArgumentException("Attendee limit must be at least 1.");
        }

        for (AgendaItemRequest agendaItem : request.getAgendaItems()) {
            if (agendaItem.getStartTime().isBefore(request.getEventDate()) || agendaItem.getEndTime().isAfter(request.getEventEndDate())) {
                throw new IllegalArgumentException("Agenda items must be within the event duration.");
            }

            if (agendaItem.getStartTime().isAfter(agendaItem.getEndTime())) {
                throw new IllegalArgumentException("Agenda item start time must be before end time.");
            }
        }
    }

    public void validateEventDatesBeforeUpdate(UpdateEventRequest request) {
        if (request.getEventDate().isAfter(request.getEventEndDate())) {
            throw new IllegalArgumentException("Event start date must be before end date.");
        }

        if (request.getJoinDeadline() != null && request.getJoinDeadline().isAfter(request.getEventDate())) {
            throw new IllegalArgumentException("Join deadline must be before the event start date.");
        }

        if (request.getAttendeeLimit() != null && request.getAttendeeLimit() < 1) {
            throw new IllegalArgumentException("Attendee limit must be at least 1.");
        }

        LocalDateTime joinDeadlineLocalDateTime = null;
        if (request.getJoinDeadline() != null) {
            joinDeadlineLocalDateTime = timeZoneConversionUtil.convertToBelgradeTime(request.getJoinDeadline());
            if (joinDeadlineLocalDateTime.isAfter(request.getEventDate())) {
                throw new IllegalArgumentException("Join deadline must be before the event start date.");
            }
        }

        List<AgendaItemUpdateRequest> agendaItems = request.getAgendaItems();
        if (agendaItems != null) {
            for (AgendaItemUpdateRequest agendaItem : agendaItems) {
                if (agendaItem.getStartTime().isBefore(request.getEventDate()) || agendaItem.getEndTime().isAfter(request.getEventEndDate())) {
                    throw new IllegalArgumentException("Agenda items must be within the event duration.");
                }

                if (agendaItem.getStartTime().isAfter(agendaItem.getEndTime())) {
                    throw new IllegalArgumentException("Agenda item start time must be before end time.");
                }
            }
        }
    }

}