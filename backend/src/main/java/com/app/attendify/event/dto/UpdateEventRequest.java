package com.app.attendify.event.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UpdateEventRequest {
    private String name;
    private String description;
    private String location;
    private Integer attendeeLimit;
    private LocalDateTime eventDate;
    private LocalDateTime eventEndDate;
    private LocalDateTime joinDeadline;
    private boolean joinApproval;
    private List<AgendaItemUpdateRequest> agendaItems;

    public UpdateEventRequest(String name, String description, String location, Integer attendeeLimit, LocalDateTime eventDate, LocalDateTime eventEndDate, LocalDateTime joinDeadline, boolean joinApproval, List<AgendaItemUpdateRequest> agendaItems) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.attendeeLimit = attendeeLimit;
        this.eventDate = eventDate;
        this.eventEndDate = eventEndDate;
        this.joinDeadline = joinDeadline;
        this.joinApproval = joinApproval;
        this.agendaItems = agendaItems;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getAttendeeLimit() {
        return attendeeLimit;
    }

    public void setAttendeeLimit(Integer attendeeLimit) {
        this.attendeeLimit = attendeeLimit;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public LocalDateTime getEventEndDate() {
        return eventEndDate;
    }

    public void setEventEndDate(LocalDateTime eventEndDate) {
        this.eventEndDate = eventEndDate;
    }

    public void setJoinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
    }

    public LocalDateTime getJoinDeadline() {
        return joinDeadline;
    }

    public void joinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
    }

    public boolean isJoinApproval() {
        return joinApproval;
    }

    public void setJoinApproval(boolean joinApproval) {
        this.joinApproval = joinApproval;
    }

    public List<AgendaItemUpdateRequest> getAgendaItems() {
        return agendaItems;
    }

    public void setAgendaItems(List<AgendaItemUpdateRequest> agendaItems) {
        this.agendaItems = agendaItems;
    }
}
