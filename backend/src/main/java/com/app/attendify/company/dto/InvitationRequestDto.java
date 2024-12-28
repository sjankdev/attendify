package com.app.attendify.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public class InvitationRequestDto {

    @NotNull(message = "Email is required.")
    @Email(message = "Please enter a valid email address.")
    private String email;

    @NotNull(message = "Company ID is required.")
    private Integer companyId;

    private Integer departmentId;

    public Integer getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Integer departmentId) {
        this.departmentId = departmentId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Integer companyId) {
        this.companyId = companyId;
    }
}
