package com.app.attendify.event.dto;

import com.app.attendify.eventOrganizer.dto.EventForOrganizersDTO;

import java.util.List;

public class EventFilterSummaryForOrganizerDTO {

    private List<EventForOrganizersDTO> events;
    private int thisWeekCount;
    private int thisMonthCount;
    private int allEventsCount;

    public EventFilterSummaryForOrganizerDTO(List<EventForOrganizersDTO> events, int thisWeekCount, int thisMonthCount, int allEventsCount) {
        this.events = events;
        this.thisWeekCount = thisWeekCount;
        this.thisMonthCount = thisMonthCount;
        this.allEventsCount = allEventsCount;
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
}
