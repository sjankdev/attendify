package com.app.attendify.eventOrganizer.dto;

import com.app.attendify.event.dto.AgendaItemDTO;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;


public class EventForOrganizersDTO {
    private Integer id;
    private String name;
    private String description;
    private String location;
    private String companyName;
    private String organizerName;
    private Integer availableSeats;
    private Integer attendeeLimit;
    private LocalDateTime joinDeadline;
    private Integer acceptedParticipants;
    private boolean joinApproval;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventEndDate;

    private List<AgendaItemDTO> agendaItems;

    private Integer pendingRequests;

    public EventForOrganizersDTO(Integer id, String name, String description, String location, String companyName, String organizerName, Integer availableSeats, LocalDateTime eventStartDate, Integer attendeeLimit, LocalDateTime joinDeadline, Integer acceptedParticipants, boolean joinApproval, LocalDateTime eventEndDate, List<AgendaItemDTO> agendaItems, Integer pendingRequests) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.location = location;
        this.companyName = companyName;
        this.organizerName = organizerName;
        this.availableSeats = availableSeats;
        this.eventStartDate = eventStartDate;
        this.attendeeLimit = attendeeLimit;
        this.joinDeadline = joinDeadline;
        this.acceptedParticipants = acceptedParticipants;
        this.joinApproval = joinApproval;
        this.eventEndDate = eventEndDate;
        this.agendaItems = agendaItems;
        this.pendingRequests = pendingRequests;
    }

    public List<AgendaItemDTO> getAgendaItems() {
        return agendaItems;
    }

    public void setAgendaItems(List<AgendaItemDTO> agendaItems) {
        this.agendaItems = agendaItems;
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
        return eventStartDate;
    }

    public void setDate(LocalDateTime eventStartDate) {
        this.eventStartDate = eventStartDate;
    }

    public LocalDateTime getEventEndDate() {
        return eventEndDate;
    }

    public void setEventEndDate(LocalDateTime eventEndDate) {
        this.eventEndDate = eventEndDate;
    }

    public Integer getAttendeeLimit() {
        return attendeeLimit;
    }

    public void setAttendeeLimit(Integer attendeeLimit) {
        this.attendeeLimit = attendeeLimit;
    }

    public LocalDateTime getEventStartDate() {
        return eventStartDate;
    }

    public void setEventStartDate(LocalDateTime eventStartDate) {
        this.eventStartDate = eventStartDate;
    }

    public LocalDateTime getJoinDeadline() {
        return joinDeadline;
    }

    public void setJoinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
    }

    public Integer getAcceptedParticipants() {
        return acceptedParticipants;
    }

    public void setAcceptedParticipants(Integer acceptedParticipants) {
        this.acceptedParticipants = acceptedParticipants;
    }

    public boolean isJoinApproval() {
        return joinApproval;
    }

    public void setJoinApproval(boolean joinApproval) {
        this.joinApproval = joinApproval;
    }

    public Integer getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(Integer pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

}
