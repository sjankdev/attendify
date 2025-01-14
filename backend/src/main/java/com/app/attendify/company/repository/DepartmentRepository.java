package com.app.attendify.company.repository;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {

    List<Department> findByCompany(Company company);

    @Query("SELECT d FROM Department d WHERE d.id IN :ids AND d.company = :company")
    List<Department> findByIdInAndCompany(@Param("ids") List<Integer> ids, @Param("company") Company company);
}
