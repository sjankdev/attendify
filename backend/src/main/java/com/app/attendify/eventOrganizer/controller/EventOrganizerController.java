package com.app.attendify.eventOrganizer.controller;

import com.app.attendify.security.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/event-organizer")
@RestController
public class EventOrganizerController {

    @GetMapping("/home")
    @PreAuthorize("hasRole('EVENT_ORGANIZER')")
    public ResponseEntity<String> testEventOrganizerRole() {
        return ResponseEntity.ok("You are authorized as an EVENT_ORGANIZER!");
    }
}
