package com.app.attendify.event.dto;

import com.app.attendify.eventParticipant.dto.EventForParticipantsDTO;

import java.util.List;

public class EventFilterSummaryForParticipantDTO {

    private List<EventForParticipantsDTO> events;
    private int thisWeekCount;
    private int thisMonthCount;
    private int allEventsCount;
    private int upcomingEventsCount;

    public EventFilterSummaryForParticipantDTO(List<EventForParticipantsDTO> events, int thisWeekCount, int thisMonthCount, int allEventsCount, int upcomingEventsCount) {
        this.events = events;
        this.thisWeekCount = thisWeekCount;
        this.thisMonthCount = thisMonthCount;
        this.allEventsCount = allEventsCount;
        this.upcomingEventsCount = upcomingEventsCount;
    }

    public List<EventForParticipantsDTO> getEvents() {
        return events;
    }

    public void setEvents(List<EventForParticipantsDTO> events) {
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

    public int getUpcomingEventsCount() {
        return upcomingEventsCount;
    }

    public void setUpcomingEventsCount(int upcomingEventsCount) {
        this.upcomingEventsCount = upcomingEventsCount;
    }
}
