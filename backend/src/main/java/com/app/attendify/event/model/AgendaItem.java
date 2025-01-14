package com.app.attendify.event.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class AgendaItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "event_id", referencedColumnName = "id")
    private Event event;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    public Integer getId() {
        return id;
    }

    public AgendaItem setId(Integer id) {
        this.id = id;
        return this;
    }

    public Event getEvent() {
        return event;
    }

    public AgendaItem setEvent(Event event) {
        this.event = event;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public AgendaItem setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public AgendaItem setDescription(String description) {
        this.description = description;
        return this;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public AgendaItem setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
        return this;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public AgendaItem setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
        return this;
    }
}
