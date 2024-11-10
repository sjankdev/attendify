package com.app.attendify.eventParticipant.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/event-participant")
@RestController
public class EventParticipantController {

    @GetMapping("/home")
    @PreAuthorize("hasRole('EVENT_PARTICIPANT')")
    public ResponseEntity<String> testEventParticipantRole() {
        return ResponseEntity.ok("You are authorized as an EVENT_PARTICIPANT!");
    }

}
