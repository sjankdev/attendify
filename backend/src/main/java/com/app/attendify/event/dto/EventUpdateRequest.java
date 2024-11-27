package com.app.attendify.event.dto;

import java.util.Date;

public class EventUpdateRequest {
    private String name;
    private String description;
    private Date eventDate;
    private Boolean isEventActive;

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

    public Date getEventDate() {
        return eventDate;
    }

    public void setEventDate(Date eventDate) {
        this.eventDate = eventDate;
    }

    public Boolean getIsEventActive() {
        return isEventActive;
    }

    public void setIsEventActive(Boolean isEventActive) {
        this.isEventActive = isEventActive;
    }
}
