package com.app.attendify.eventParticipant.dto;

import java.util.List;

public class EventParticipantDTO {
    private Integer id;
    private String fullName;
    private String email;
    private String companyName;
    private Integer joinedEventCount;
    private List<String> eventLinks;

    public EventParticipantDTO(Integer id, String fullName, String email, String companyName, Integer joinedEventCount, List<String> eventLinks) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.companyName = companyName;
        this.joinedEventCount = joinedEventCount;
        this.eventLinks = eventLinks;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public Integer getJoinedEventCount() {
        return joinedEventCount;
    }

    public void setJoinedEventCount(Integer joinedEventCount) {
        this.joinedEventCount = joinedEventCount;
    }

    public List<String> getEventLinks() {
        return eventLinks;
    }

    public void setEventLinks(List<String> eventLinks) {
        this.eventLinks = eventLinks;
    }
}
