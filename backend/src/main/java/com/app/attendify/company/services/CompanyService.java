package com.app.attendify.company.services;

import com.app.attendify.company.dto.DepartmentDto;
import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Department;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.company.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<DepartmentDto> getDepartmentsByCompanyId(Integer companyId) {
        Optional<Company> companyOpt = companyRepository.findById(companyId);

        if (companyOpt.isEmpty()) {
            throw new RuntimeException("Company not found with id " + companyId);
        }

        Company company = companyOpt.get();
        List<Department> departments = departmentRepository.findByCompany(company);
        return departments.stream()
                .map(department -> new DepartmentDto(department.getId(), department.getName()))
                .collect(Collectors.toList());
    }

    public void addDepartmentsToCompany(Integer companyId, List<String> departmentNames) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        for (String departmentName : departmentNames) {
            Department department = new Department();
            department.setName(departmentName);
            department.setCompany(company);

            try {
                departmentRepository.save(department);
            } catch (Exception e) {
                System.err.println("Error saving department: " + e.getMessage());
                throw new RuntimeException("Failed to save department: " + departmentName);
            }
        }
    }
}
