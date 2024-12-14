package com.app.attendify.event.dto;

import java.time.LocalDateTime;

public class AgendaItemRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public String getTitle() {
        return title;
    }

    public AgendaItemRequest setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public AgendaItemRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public AgendaItemRequest setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public AgendaItemRequest setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
        return this;
    }
}
