package com.app.attendify.eventParticipant.model;

import com.app.attendify.company.model.Company;
import com.app.attendify.event.model.ParticipantEvent;
import com.app.attendify.security.model.User;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
public class EventParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id")
    private Company company;

    @OneToMany(mappedBy = "participant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ParticipantEvent> participantEvents = new ArrayList<>();

    public Integer getId() {
        return id;
    }

    public EventParticipant setId(Integer id) {
        this.id = id;
        return this;
    }

    public User getUser() {
        return user;
    }

    public EventParticipant setUser(User user) {
        this.user = user;
        return this;
    }

    public Company getCompany() {
        return company;
    }

    public EventParticipant setCompany(Company company) {
        this.company = company;
        return this;
    }

    public List<ParticipantEvent> getParticipantEvents() {
        return participantEvents;
    }

    public void setParticipantEvents(List<ParticipantEvent> participantEvents) {
        this.participantEvents = participantEvents;
    }
}
