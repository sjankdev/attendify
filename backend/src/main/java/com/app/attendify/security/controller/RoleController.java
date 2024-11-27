package com.app.attendify.security.controller;

import com.app.attendify.security.model.Role;
import com.app.attendify.security.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RequestMapping("/api/auth")
@RestController
public class RoleController {

    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);

    private final RoleService roleService;

    // Constructor Injection
    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping("/roles")
    public List<Role> getRoles() {
        List<Role> roles = roleService.getAllRoles();

        // Log the roles fetched
        logger.info("Fetched roles: {}", roles);

        return roles;
    }
}