package com.app.attendify.event.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public class EventUpdateDTO {
    private Integer id;
    private String name;
    private String description;
    private String location;
    private String companyName;
    private String organizerName;
    private Integer availableSeats;
    private Integer attendeeLimit;
    private LocalDateTime joinDeadline;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventDate;

    public EventUpdateDTO(Integer id, String name, String description, String location, String companyName, String organizerName, Integer availableSeats, LocalDateTime eventDate, Integer attendeeLimit, LocalDateTime joinDeadline) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.companyName = companyName;
        this.organizerName = organizerName;
        this.availableSeats = availableSeats;
        this.eventDate = eventDate;
        this.attendeeLimit = attendeeLimit;
        this.joinDeadline = joinDeadline;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public Integer getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(Integer availableSeats) {
        this.availableSeats = availableSeats;
    }

    public LocalDateTime getDate() {
        return eventDate;
    }

    public void setDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
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

    public void setJoinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
    }

}
