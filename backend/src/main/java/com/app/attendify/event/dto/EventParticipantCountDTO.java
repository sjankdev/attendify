package com.app.attendify.event.dto;

public class EventParticipantCountDTO {

    private Integer eventId;
    private String eventName;
    private Long uniqueParticipantsCount;

    public Integer getEventId() {
        return eventId;
    }

    public void setEventId(Integer eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Long getUniqueParticipantsCount() {
        return uniqueParticipantsCount;
    }

    public void setUniqueParticipantsCount(Long uniqueParticipantsCount) {
        this.uniqueParticipantsCount = uniqueParticipantsCount;
    }
}
