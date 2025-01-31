package com.app.attendify.company.dto;

import com.app.attendify.event.dto.EventDetailDTO;
import com.app.attendify.eventParticipant.dto.EventParticipantDTO;

import java.util.List;

public class DepartmentDto {

    private Integer id;
    private String name;
    private List<EventParticipantDTO> participants;
    private List<EventDetailDTO> events;

    public DepartmentDto(Integer id, String name, List<EventParticipantDTO> participants, List<EventDetailDTO> events) {
        this.id = id;
        this.name = name;
        this.participants = participants;
        this.events = events;
    }

    public DepartmentDto(Integer id, String name, List<EventParticipantDTO> participants) {
        this.id = id;
        this.name = name;
        this.participants = participants;
    }

    public DepartmentDto(Integer id, String name) {
        this.id = id;
        this.name = name;
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

    public List<EventParticipantDTO> getParticipants() {
        return participants;
    }

    public void setParticipants(List<EventParticipantDTO> participants) {
        this.participants = participants;
    }

    public List<EventDetailDTO> getEvents() {
        return events;
    }

    public void setEvents(List<EventDetailDTO> events) {
        this.events = events;
    }
}
