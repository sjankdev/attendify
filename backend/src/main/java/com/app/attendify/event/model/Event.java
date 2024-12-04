package com.app.attendify.event.model;

import com.app.attendify.company.model.Company;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.eventParticipant.model.EventParticipant;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id")
    @JsonIgnore
    private Company company;

    @ManyToOne
    @JoinColumn(name = "organizer_id", referencedColumnName = "id")
    @JsonIgnore
    private EventOrganizer organizer;

    @OneToMany(mappedBy = "event")
    private List<EventParticipant> participants;

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

    public Company getCompany() {
        return company;
    }

    public Event setCompany(Company company) {
        this.company = company;
        return this;
    }

    public EventOrganizer getOrganizer() {
        return organizer;
    }

    public Event setOrganizer(EventOrganizer organizer) {
        this.organizer = organizer;
        return this;
    }

    public List<EventParticipant> getParticipants() {
        return participants;
    }

    public Event setParticipants(List<EventParticipant> participants) {
        this.participants = participants;
        return this;
    }
}
