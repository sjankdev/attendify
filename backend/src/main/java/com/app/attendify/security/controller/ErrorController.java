package com.app.attendify.security.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ErrorController {

    @GetMapping("/403")
    public ResponseEntity<String> handleAccessDenied() {
        return ResponseEntity.status(403).body("Access Denied: You don't have permission to access this resource.");
    }
}
