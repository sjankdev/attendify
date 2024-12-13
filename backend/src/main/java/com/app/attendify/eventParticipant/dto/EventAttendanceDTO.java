package com.app.attendify.eventParticipant.dto;

public class EventAttendanceDTO {
    private String participantName;
    private String participantEmail;
    private int participantId;

    public EventAttendanceDTO(String participantName, String participantEmail, int participantId) {
        this.participantName = participantName;
        this.participantEmail = participantEmail;
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

    public int getParticipantId() {
        return participantId;
    }

    public void setParticipantId(int participantId) {
        this.participantId = participantId;
    }
}
