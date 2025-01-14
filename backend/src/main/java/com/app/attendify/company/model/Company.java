package com.app.attendify.company.model;

import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.eventParticipant.model.EventParticipant;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @OneToOne
    @JoinColumn(name = "owner_id", referencedColumnName = "id")
    private EventOrganizer owner;

    @OneToMany(mappedBy = "company")
    private List<EventParticipant> participants;

    @OneToMany(mappedBy = "company")
    private List<Department> departments;

    public List<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(List<Department> departments) {
        this.departments = departments;
    }

    public Integer getId() {
        return id;
    }

    public Company setId(Integer id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public Company setName(String name) {
        this.name = name;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Company setDescription(String description) {
        this.description = description;
        return this;
    }

    public EventOrganizer getOwner() {
        return owner;
    }

    public Company setOwner(EventOrganizer owner) {
        this.owner = owner;
        return this;
    }

    public List<EventParticipant> getParticipants() {
        return participants;
    }

    public Company setParticipants(List<EventParticipant> participants) {
        this.participants = participants;
        return this;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Company company = (Company) o;
        return id != null && id.equals(company.id);
    }

    @Override
    public int hashCode() {
        return 31 * (id != null ? id.hashCode() : 0);
    }
}
