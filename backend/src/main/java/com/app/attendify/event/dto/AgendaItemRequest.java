package com.app.attendify.event.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class AgendaItemRequest {

    @NotBlank(message = "Agenda item title is required.")
    @Size(min = 10, message = "Agenda item title must be at least 10 characters long.")
    private String title;

    @NotBlank(message = "Agenda item description is required.")
    @Size(min = 50, message = "Agenda item description must be at least 50 characters long.")
    private String description;

    @NotNull
    @FutureOrPresent(message = "Agenda item start time must be in the future.")
    private LocalDateTime startTime;

    @NotNull
    @FutureOrPresent(message = "Agenda item end time must be in the future.")
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
