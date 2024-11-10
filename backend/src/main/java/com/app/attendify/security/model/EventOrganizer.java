package com.app.attendify.security.model;

import jakarta.persistence.*;

@Entity
public class EventOrganizer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;


    public EventOrganizer setUser(User user) {
        this.user = user;
        return this;
    }
}
