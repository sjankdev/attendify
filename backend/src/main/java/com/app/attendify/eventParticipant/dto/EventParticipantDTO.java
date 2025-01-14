package com.app.attendify.eventParticipant.dto;

import java.util.List;

public class EventParticipantDTO {

    private Integer participantId;
    private String participantName;
    private String participantEmail;
    private String companyName;
    private Integer joinedEventCount;
    private List<String> eventLinks;
    private String departmentName;

    public EventParticipantDTO(Integer participantId, String participantName, String participantEmail, String companyName, Integer joinedEventCount, List<String> eventLinks, String departmentName) {
        this.participantId = participantId;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
        this.companyName = companyName;
        this.joinedEventCount = joinedEventCount;
        this.eventLinks = eventLinks;
        this.departmentName = departmentName;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Integer getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Integer participantId) {
        this.participantId = participantId;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getParticipantEmail() {
        return participantEmail;
    }

    public void setParticipantEmail(String participantEmail) {
        this.participantEmail = participantEmail;
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
