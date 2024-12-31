package com.app.attendify.eventParticipant.dto;

import com.app.attendify.event.dto.AgendaItemDTO;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;
import java.util.List;

public class EventForParticipantsDTO {
    private Integer id;
    private String name;
    private String description;
    private String location;
    private String companyName;
    private String organizerName;
    private Integer availableSeats;
    private Integer attendeeLimit;
    private LocalDateTime joinDeadline;
    private Integer joinedParticipants;
    private boolean joinApproval;
    private String status;
    private List<AgendaItemDTO> agendaItems;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventStartDate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime eventEndDate;

    private Integer pendingRequests;

    private List<String> departmentNames;

    public EventForParticipantsDTO(Integer id, String name, String description, String location, String companyName, String organizerName, Integer availableSeats, LocalDateTime eventStartDate, Integer attendeeLimit, LocalDateTime joinDeadline, Integer joinedParticipants, boolean joinApproval, String status, LocalDateTime eventEndDate, List<AgendaItemDTO> agendaItems, Integer pendingRequests, List<String> departmentNames) {
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
        this.joinedParticipants = joinedParticipants;
        this.joinApproval = joinApproval;
        this.status = status;
        this.eventEndDate = eventEndDate;
        this.agendaItems = agendaItems;
        this.pendingRequests = pendingRequests;
        this.departmentNames = departmentNames;
    }

    public Integer getId() {
        return id;
    }

    public List<AgendaItemDTO> getAgendaItems() {
        return agendaItems;
    }

    public void setAgendaItems(List<AgendaItemDTO> agendaItems) {
        this.agendaItems = agendaItems;
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

    public Integer getJoinedParticipants() {
        return joinedParticipants;
    }

    public void setJoinedParticipants(Integer joinedParticipants) {
        this.joinedParticipants = joinedParticipants;
    }

    public boolean isJoinApproval() {
        return joinApproval;
    }

    public void setJoinApproval(boolean joinApproval) {
        this.joinApproval = joinApproval;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getPendingRequests() {
        return pendingRequests;
    }

    public void setPendingRequests(Integer pendingRequests) {
        this.pendingRequests = pendingRequests;
    }

    public List<String> getDepartmentNames() {
        return departmentNames;
    }

    public void setDepartmentNames(List<String> departmentNames) {
        this.departmentNames = departmentNames;
    }
}
