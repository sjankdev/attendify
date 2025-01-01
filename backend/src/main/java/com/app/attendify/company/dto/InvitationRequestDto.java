package com.app.attendify.company.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class InvitationRequestDto {

    @NotNull(message = "Emails are required.")
    private List<EmailDepartment> emails;

    @NotNull(message = "Company ID is required.")
    private Integer companyId;

    public List<EmailDepartment> getEmails() {
        return emails;
    }

    public void setEmails(List<EmailDepartment> emails) {
        this.emails = emails;
    }

    public Integer getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Integer companyId) {
        this.companyId = companyId;
    }

    public static class EmailDepartment {
        @Email(message = "Please enter a valid email address.")
        @NotNull(message = "Email is required.")
        private String email;

        private Integer departmentId;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Integer getDepartmentId() {
            return departmentId;
        }

        public void setDepartmentId(Integer departmentId) {
            this.departmentId = departmentId;
        }
    }
}
