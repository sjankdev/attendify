package com.app.attendify.security.model;

import com.app.attendify.company.model.Company;
import jakarta.persistence.*;

@Entity
public class EventOrganizer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "company_id", referencedColumnName = "id")
    private Company company;

    public Integer getId() {
        return id;
    }

    public EventOrganizer setId(Integer id) {
        this.id = id;
        return this;
    }

    public User getUser() {
        return user;
    }

    public EventOrganizer setUser(User user) {
        this.user = user;
        return this;
    }

    public Company getCompany() {
        return company;
    }

    public EventOrganizer setCompany(Company company) {
        this.company = company;
        return this;
    }
}
