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

    private final CompanyService companyService;
    private final AuthenticationService authenticationService;

    @Autowired
    public CompanyController(CompanyService companyService, AuthenticationService authenticationService) {
        this.companyService = companyService;
        this.authenticationService = authenticationService;
    }

    @GetMapping("/{companyId}/departments")
    public List<DepartmentDto> getDepartments(@PathVariable Integer companyId) {
        return companyService.getDepartmentsByCompanyId(companyId);
    }

    @GetMapping("/auth/company")
    public Company getLoggedInCompany() {
        return authenticationService.getLoggedInOrganizerCompany();
    }
}
