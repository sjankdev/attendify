package com.app.attendify.event.dto;

import java.time.LocalDateTime;

public class UpdateEventRequest {
    private String name;
    private String description;
    private String location;
    private Integer attendeeLimit;
    private LocalDateTime eventDate;
    private LocalDateTime joinDeadline;

    public UpdateEventRequest(String name, String description, String location, Integer attendeeLimit, LocalDateTime eventDate, LocalDateTime joinDeadline) {
        this.name = name;
        this.description = description;
        this.location = location;
        this.attendeeLimit = attendeeLimit;
        this.eventDate = eventDate;
        this.joinDeadline = joinDeadline;
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

    public LocalDateTime getJoinDeadline() {
        return joinDeadline;
    }

    public void joinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
    }
}
