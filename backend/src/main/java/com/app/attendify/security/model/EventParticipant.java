package com.app.attendify.security.model;

import com.app.attendify.company.model.Company;
import com.app.attendify.event.model.Event;
import jakarta.persistence.*;

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

    @ManyToOne
    @JoinColumn(name = "event_id", referencedColumnName = "id")
    private Event event;

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

    public Event getEvent() {
        return event;
    }

    public EventParticipant setEvent(Event event) {
        this.event = event;
        return this;
    }

}
