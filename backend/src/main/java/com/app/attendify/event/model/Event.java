package com.app.attendify.event.model;

import com.app.attendify.security.model.EventOrganizer;
import jakarta.persistence.*;

import java.util.Date;

@Entity
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date eventDate;

    @ManyToOne
    @JoinColumn(name = "event_organizer_id", referencedColumnName = "id", nullable = false)
    private EventOrganizer eventOrganizer;

    @Column(nullable = false)
    private Boolean isEventActive = true;

    public Integer getId() {
        return id;
    }

    public Event setId(Integer id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public Event setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Event setDescription(String description) {
        this.description = description;
        return this;
    }

    public Date getEventDate() {
        return eventDate;
    }

    public Event setEventDate(Date eventDate) {
        this.eventDate = eventDate;
        return this;
    }

    public EventOrganizer getEventOrganizer() {
        return eventOrganizer;
    }

    public Event setEventOrganizer(EventOrganizer eventOrganizer) {
        this.eventOrganizer = eventOrganizer;
        return this;
    }

    public Boolean getIsEventActive() {
        return isEventActive;
    }

    public Event setIsEventActive(Boolean isEventActive) {
        this.isEventActive = isEventActive;
        return this;
    }

    @Override
    public String toString() {
        return "Event{" + "id=" + id + ", name='" + name + '\'' + ", description='" + description + '\'' + ", eventDate=" + eventDate + ", eventOrganizer=" + eventOrganizer + ", isEventActive=" + isEventActive + '}';
    }
}
