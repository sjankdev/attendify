package com.app.attendify.event.dto;

import com.app.attendify.eventParticipant.dto.ParticipantDTO;

import java.time.LocalDateTime;
import java.util.List;

public class EventDetailDTO {
    private int id;
    private String name;
    private String description;
    private String location;
    private LocalDateTime eventStartDate;
    private LocalDateTime eventEndDate;
    private String organizerName;
    private String attendeeLimit;
    private List<ParticipantDTO> joinedParticipants;

    public EventDetailDTO(int id, String name, String description, String location,
                          LocalDateTime eventStartDate, LocalDateTime eventEndDate,
                          String organizerName, String attendeeLimit, List<ParticipantDTO> joinedParticipants) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.eventStartDate = eventStartDate;
        this.eventEndDate = eventEndDate;
        this.organizerName = organizerName;
        this.attendeeLimit = attendeeLimit;
        this.joinedParticipants = joinedParticipants;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public LocalDateTime getEventStartDate() {
        return eventStartDate;
    }

    public void setEventStartDate(LocalDateTime eventStartDate) {
        this.eventStartDate = eventStartDate;
    }

    public LocalDateTime getEventEndDate() {
        return eventEndDate;
    }

    public void setEventEndDate(LocalDateTime eventEndDate) {
        this.eventEndDate = eventEndDate;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public String getAttendeeLimit() {
        return attendeeLimit;
    }

    public void setAttendeeLimit(String attendeeLimit) {
        this.attendeeLimit = attendeeLimit;
    }

    public List<ParticipantDTO> getJoinedParticipants() {
        return joinedParticipants;
    }

    public void setJoinedParticipants(List<ParticipantDTO> joinedParticipants) {
        this.joinedParticipants = joinedParticipants;
    }
}
