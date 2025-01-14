package com.app.attendify.event.repository;

import com.app.attendify.company.model.Company;
import com.app.attendify.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByCompany(Company company);

    @Query("SELECT e FROM Event e WHERE e.availableForAllDepartments = true")
    List<Event> findByAvailableForAllDepartmentsTrue();
}
