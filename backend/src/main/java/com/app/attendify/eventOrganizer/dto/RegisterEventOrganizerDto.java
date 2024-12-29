package com.app.attendify.eventOrganizer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class RegisterEventOrganizerDto {
    @NotEmpty(message = "Full Name cannot be empty")
    @Size(min = 10, message = "Full Name must be at least 8 characters long")
    private String fullName;

    @NotEmpty(message = "Email cannot be empty")
    @Email(message = "Invalid email format")
    private String email;

    @NotEmpty(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @NotEmpty(message = "Company Name cannot be empty")
    @Size(min = 3, message = "Company Name must be at least 3 characters long")
    private String companyName;

    @NotEmpty(message = "Company Description cannot be empty")
    @Size(min = 10, message = "Company Description must be at least 10 characters long")
    private String companyDescription;

    @NotEmpty(message = "Department name cannot be empty")
    private List<String> departmentNames;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getCompanyDescription() {
        return companyDescription;
    }

    public void setCompanyDescription(String companyDescription) {
        this.companyDescription = companyDescription;
    }

    public List<String> getDepartmentNames() {
        return departmentNames;
    }

    public void setDepartmentNames(List<String> departmentNames) {
        this.departmentNames = departmentNames;
    }
}
