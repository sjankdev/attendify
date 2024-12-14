package com.app.attendify.event.model;

import com.app.attendify.company.model.Company;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

    @Column(nullable = false)
    private String location;

    @Column(nullable = true)
    private Integer attendeeLimit;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    @Column(nullable = false)
    private LocalDateTime eventEndDate;

    @Column(nullable = true)
    private LocalDateTime joinDeadline;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id")
    @JsonIgnore
    private Company company;

    @ManyToOne
    @JoinColumn(name = "organizer_id", referencedColumnName = "id")
    @JsonIgnore
    private EventOrganizer organizer;

    @Column(nullable = false)
    private boolean joinApproval;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<EventAttendance> eventAttendances = new ArrayList<>();

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

    public String getLocation() {
        return location;
    }

    public Event setLocation(String location) {
        this.location = location;
        return this;
    }

    public Integer getAttendeeLimit() {
        return attendeeLimit;
    }

    public Event setAttendeeLimit(Integer attendeeLimit) {
        this.attendeeLimit = attendeeLimit;
        return this;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public Event setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
        return this;
    }

    public LocalDateTime getEventEndDate() {
        return eventEndDate;
    }

    public Event setEventEndDate(LocalDateTime eventEndDate) {
        this.eventEndDate = eventEndDate;
        return this;
    }


    public LocalDateTime getJoinDeadline() {
        return joinDeadline;
    }

    public Event setJoinDeadline(LocalDateTime joinDeadline) {
        this.joinDeadline = joinDeadline;
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

    public List<EventAttendance> getParticipantEvents() {
        return eventAttendances;
    }

    public void setParticipantEvents(List<EventAttendance> eventAttendances) {
        this.eventAttendances = eventAttendances;
    }

    public boolean isJoinApproval() {
        return joinApproval;
    }

    public Event setJoinApproval(boolean joinApproval) {
        this.joinApproval = joinApproval;
        return this;
    }

    public Integer getAvailableSlots() {
        if (attendeeLimit == null) {
            return null;
        }
        return attendeeLimit - eventAttendances.size();
    }

}
