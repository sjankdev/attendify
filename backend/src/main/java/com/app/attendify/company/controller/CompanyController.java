package com.app.attendify.company.controller;

import com.app.attendify.company.dto.DepartmentDto;
import com.app.attendify.company.model.Company;
import com.app.attendify.company.services.CompanyService;
import com.app.attendify.security.services.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;
    private AuthenticationService authenticationService;

    @GetMapping("/{companyId}/departments")
    public List<DepartmentDto> getDepartments(@PathVariable Integer companyId) {
        return companyService.getDepartmentsByCompanyId(companyId);
    }

    @GetMapping("/auth/company")
    public Company getLoggedInCompany() {
        return authenticationService.getLoggedInOrganizerCompany();
    }
}
