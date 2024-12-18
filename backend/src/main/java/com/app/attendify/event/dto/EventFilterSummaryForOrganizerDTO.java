package com.app.attendify.event.dto;

import com.app.attendify.eventOrganizer.dto.EventForOrganizersDTO;

import java.util.List;

public class EventFilterSummaryForOrganizerDTO {

    private List<EventForOrganizersDTO> events;
    private int thisWeekCount;
    private int thisMonthCount;
    private int allEventsCount;
    private int thisWeekParticipants;
    private int thisMonthParticipants;
    private int allEventsParticipants;

    public EventFilterSummaryForOrganizerDTO(List<EventForOrganizersDTO> events, int thisWeekCount, int thisMonthCount, int allEventsCount, int thisWeekParticipants, int thisMonthParticipants, int allEventsParticipants) {
        this.events = events;
        this.thisWeekCount = thisWeekCount;
        this.thisMonthCount = thisMonthCount;
        this.allEventsCount = allEventsCount;
        this.thisWeekParticipants = thisWeekParticipants;
        this.thisMonthParticipants = thisMonthParticipants;
        this.allEventsParticipants = allEventsParticipants;
    }

    public List<EventForOrganizersDTO> getEvents() {
        return events;
    }

    public void setEvents(List<EventForOrganizersDTO> events) {
        this.events = events;
    }

    public int getThisWeekCount() {
        return thisWeekCount;
    }

    public void setThisWeekCount(int thisWeekCount) {
        this.thisWeekCount = thisWeekCount;
    }

    public int getThisMonthCount() {
        return thisMonthCount;
    }

    public void setThisMonthCount(int thisMonthCount) {
        this.thisMonthCount = thisMonthCount;
    }

    public int getAllEventsCount() {
        return allEventsCount;
    }

    public void setAllEventsCount(int allEventsCount) {
        this.allEventsCount = allEventsCount;
    }

    public int getThisWeekParticipants() {
        return thisWeekParticipants;
    }

    public void setThisWeekParticipants(int thisWeekParticipants) {
        this.thisWeekParticipants = thisWeekParticipants;
    }

    public int getThisMonthParticipants() {
        return thisMonthParticipants;
    }

    public void setThisMonthParticipants(int thisMonthParticipants) {
        this.thisMonthParticipants = thisMonthParticipants;
    }

    public int getAllEventsParticipants() {
        return allEventsParticipants;
    }

    public void setAllEventsParticipants(int allEventsParticipants) {
        this.allEventsParticipants = allEventsParticipants;
    }
}
