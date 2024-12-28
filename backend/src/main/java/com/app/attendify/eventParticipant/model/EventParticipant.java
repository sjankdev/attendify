package com.app.attendify.eventParticipant.model;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Department;
import com.app.attendify.event.model.EventAttendance;
import com.app.attendify.eventParticipant.enums.EducationLevel;
import com.app.attendify.eventParticipant.enums.Gender;
import com.app.attendify.eventParticipant.enums.Occupation;
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
    private List<EventAttendance> eventAttendances = new ArrayList<>();

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private Integer yearsOfExperience;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EducationLevel educationLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Occupation occupation;

    @ManyToOne
    @JoinColumn(name = "department_id", referencedColumnName = "id")
    private Department department;

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

    public List<EventAttendance> getParticipantEvents() {
        return eventAttendances;
    }

    public void setParticipantEvents(List<EventAttendance> eventAttendances) {
        this.eventAttendances = eventAttendances;
    }

    public Integer getAge() {
        return age;
    }

    public EventParticipant setAge(Integer age) {
        this.age = age;
        return this;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public EventParticipant setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
        return this;
    }

    public Gender getGender() {
        return gender;
    }

    public EventParticipant setGender(Gender gender) {
        this.gender = gender;
        return this;
    }

    public EducationLevel getEducationLevel() {
        return educationLevel;
    }

    public EventParticipant setEducationLevel(EducationLevel educationLevel) {
        this.educationLevel = educationLevel;
        return this;
    }

    public Occupation getOccupation() {
        return occupation;
    }

    public EventParticipant setOccupation(Occupation occupation) {
        this.occupation = occupation;
        return this;
    }

    public Department getDepartment() {
        return department;
    }

    public EventParticipant setDepartment(Department department) {
        this.department = department;
        return this;
    }
}
