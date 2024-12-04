package com.app.attendify.event.repository;

import com.app.attendify.company.model.Company;
import com.app.attendify.event.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Integer> {
    List<Event> findByCompany(Company company);

}
