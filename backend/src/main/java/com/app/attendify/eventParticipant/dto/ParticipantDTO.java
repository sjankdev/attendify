package com.app.attendify.eventParticipant.dto;

public class ParticipantDTO {

    private int id;
    private String participantName;
    private String participantEmail;

    public ParticipantDTO(int id, String participantName, String participantEmail) {
        this.id = id;
        this.participantName = participantName;
        this.participantEmail = participantEmail;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
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
