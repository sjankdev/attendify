package com.app.attendify.event.dto;


import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public class CreateEventRequest {

    @NotNull
    private String name;

    @NotNull
    private String description;

    @NotNull
    private String location;

    @NotNull
    private Integer organizerId;

    @Min(value = 1, message = "Attendee limit must be at least 1.")
    private Integer attendeeLimit;

    @NotNull
    @FutureOrPresent(message = "Event start date must be in the future.")
    private LocalDateTime eventDate;

    @NotNull
    @FutureOrPresent(message = "Event end date must be in the future.")
    private LocalDateTime eventEndDate;

    private LocalDateTime joinDeadline;

    private boolean joinApproval;

    private List<AgendaItemRequest> agendaItems;

    public String getName() {
        return name;
    }

    public CreateEventRequest setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateEventRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getLocation() {
        return location;
    }

    public CreateEventRequest setLocation(String location) {
        this.location = location;
        return this;
    }

    public Integer getOrganizerId() {
        return organizerId;
    }

    public CreateEventRequest setOrganizerId(Integer organizerId) {
        this.organizerId = organizerId;
        return this;
    }

    public Integer getAttendeeLimit() {
        return attendeeLimit;
    }

    public CreateEventRequest setAttendeeLimit(Integer attendeeLimit) {
        this.attendeeLimit = attendeeLimit;
        return this;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public CreateEventRequest setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
        return this;
    }

    public LocalDateTime getEventEndDate() {
        return eventEndDate;
    }

    public CreateEventRequest setEventEndDate(LocalDateTime eventEndDate) {
        this.eventEndDate = eventEndDate;
        return this;
    }

    public LocalDateTime getJoinDeadline() {
        return joinDeadline;
    }

    public void setJoinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
    }

    public boolean isJoinApproval() {
        return joinApproval;
    }

    public List<AgendaItemRequest> getAgendaItems() {
        return agendaItems;
    }

    public CreateEventRequest setAgendaItems(List<AgendaItemRequest> agendaItems) {
        this.agendaItems = agendaItems;
        return this;
    }

    public CreateEventRequest setJoinApproval(boolean joinApproval) {
        this.joinApproval = joinApproval;
        return this;
    }

}

