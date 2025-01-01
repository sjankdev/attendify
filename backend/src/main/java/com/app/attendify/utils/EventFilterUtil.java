package com.app.attendify.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

import com.app.attendify.eventOrganizer.dto.EventForOrganizersDTO;
import com.app.attendify.eventParticipant.dto.EventForParticipantsDTO;
import org.springframework.stereotype.Component;

@Component
public class EventFilterUtil {

    public List<EventForOrganizersDTO> filterEventsByCurrentWeekForOrganizer(List<EventForOrganizersDTO> events) {
        LocalDateTime startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(6).withHour(23).withMinute(59).withSecond(59);
        return events.stream()
                .filter(event -> isBetween(event.getEventStartDate(), startOfWeek, endOfWeek))
                .collect(Collectors.toList());
    }

    public List<EventForOrganizersDTO> filterEventsByCurrentMonthForOrganizer(List<EventForOrganizersDTO> events) {
        LocalDateTime startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);
        return events.stream()
                .filter(event -> isBetween(event.getEventStartDate(), startOfMonth, endOfMonth))
                .collect(Collectors.toList());
    }

    public List<EventForOrganizersDTO> filterEventsByDepartment(List<EventForOrganizersDTO> events, List<Integer> departmentIds) {
        return events.stream()
                .filter(event -> event.isAvailableForAllDepartments() ||
                        event.getDepartments().stream()
                                .anyMatch(dept -> departmentIds.contains(dept.getId())))
                .collect(Collectors.toList());
    }

    public List<EventForParticipantsDTO> filterEventsByCurrentWeekForParticipant(List<EventForParticipantsDTO> events) {
        LocalDateTime startOfWeek = LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime endOfWeek = startOfWeek.plusDays(6).withHour(23).withMinute(59).withSecond(59);
        return events.stream()
                .filter(event -> isBetween(event.getEventStartDate(), startOfWeek, endOfWeek))
                .collect(Collectors.toList());
    }

    public List<EventForParticipantsDTO> filterEventsByCurrentMonthForParticipant(List<EventForParticipantsDTO> events) {
        LocalDateTime startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);
        return events.stream()
                .filter(event -> isBetween(event.getEventStartDate(), startOfMonth, endOfMonth))
                .collect(Collectors.toList());
    }

    private boolean isBetween(LocalDateTime date, LocalDateTime start, LocalDateTime end) {
        return date != null && (date.isEqual(start) || date.isAfter(start)) && (date.isEqual(end) || date.isBefore(end));
    }
}
