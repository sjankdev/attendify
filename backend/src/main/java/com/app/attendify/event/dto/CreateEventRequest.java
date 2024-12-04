package com.app.attendify.event.dto;


import jakarta.validation.constraints.NotNull;

public class CreateEventRequest {

    @NotNull
    private String name;

    @NotNull
    private String description;

    @NotNull
    private String location;

    @NotNull
    private Integer organizerId;

    public String getName() {
        return name;
    }

    public CreateEventRequest setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateEventRequest setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getLocation() {
        return location;
    }

    public CreateEventRequest setLocation(String location) {
        this.location = location;
        return this;
    }

    public Integer getOrganizerId() {
        return organizerId;
    }

    public CreateEventRequest setOrganizerId(Integer organizerId) {
        this.organizerId = organizerId;
        return this;
    }
}
