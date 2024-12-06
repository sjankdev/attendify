package com.app.attendify.eventParticipant.dto;

public class EventParticipantDTO {
    private String participantName;
    private String participantEmail;

    public EventParticipantDTO(String participantName, String participantEmail) {
        this.participantName = participantName;
        this.participantEmail = participantEmail;
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
}
