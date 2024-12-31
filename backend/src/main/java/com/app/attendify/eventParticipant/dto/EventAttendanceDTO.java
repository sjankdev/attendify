package com.app.attendify.eventParticipant.dto;

import com.app.attendify.event.enums.AttendanceStatus;

public class EventAttendanceDTO {
    private String participantName;
    private String participantEmail;
    private int participantId;
    private AttendanceStatus status;
    private String departmentName;

    public EventAttendanceDTO(String participantName, String participantEmail, int participantId, AttendanceStatus status, String departmentName) {
        this.participantName = participantName;
        this.participantEmail = participantEmail;
        this.participantId = participantId;
        this.status = status;
        this.departmentName = departmentName;
    }

    public String getParticipantName() {
        return participantName;
    }

    public void setParticipantName(String participantName) {
        this.participantName = participantName;
    }

    public String getParticipantEmail() {
        return participantEmail;
    }

    public void setParticipantEmail(String participantEmail) {
        this.participantEmail = participantEmail;
    }

    public int getParticipantId() {
        return participantId;
    }

    public void setParticipantId(int participantId) {
        this.participantId = participantId;

    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
}
