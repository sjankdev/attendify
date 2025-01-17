package com.app.attendify.security.services;

import com.app.attendify.company.model.Company;
import com.app.attendify.company.model.Department;
import com.app.attendify.company.model.Invitation;
import com.app.attendify.company.repository.CompanyRepository;
import com.app.attendify.company.repository.DepartmentRepository;
import com.app.attendify.company.services.InvitationService;
import com.app.attendify.eventOrganizer.model.EventOrganizer;
import com.app.attendify.eventParticipant.dto.EventParticipantRegisterDto;
import com.app.attendify.eventParticipant.model.EventParticipant;
import com.app.attendify.eventParticipant.repository.EventParticipantRepository;
import com.app.attendify.exceptions.EmailAlreadyExistsException;
import com.app.attendify.security.dto.LoginUserDto;
import com.app.attendify.eventOrganizer.dto.RegisterEventOrganizerDto;
import com.app.attendify.security.model.*;
import com.app.attendify.eventOrganizer.repository.EventOrganizerRepository;
import com.app.attendify.security.repositories.RoleRepository;
import com.app.attendify.security.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.app.attendify.security.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final RoleRepository roleRepository;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final CompanyRepository companyRepository;
    private final JavaMailSender javaMailSender;
    private final EventParticipantRepository eventParticipantRepository;
    private final InvitationService invitationService;
    private final DepartmentRepository departmentRepository;

    @Autowired
    public AuthenticationService(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, RoleRepository roleRepository, EventOrganizerRepository eventOrganizerRepository, CompanyRepository companyRepository, JavaMailSender javaMailSender, EventParticipantRepository eventParticipantRepository, InvitationService invitationService, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.roleRepository = roleRepository;
        this.eventOrganizerRepository = eventOrganizerRepository;
        this.companyRepository = companyRepository;
        this.javaMailSender = javaMailSender;
        this.eventParticipantRepository = eventParticipantRepository;
        this.invitationService = invitationService;
        this.departmentRepository = departmentRepository;
    }

    public User registerEventOrganizer(@Valid RegisterEventOrganizerDto input) {
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists. Please use a different email.");
        }

        RoleEnum roleEnum = RoleEnum.EVENT_ORGANIZER;
        Optional<Role> optionalRole = roleRepository.findByName(roleEnum);
        if (optionalRole.isEmpty()) {
            throw new RuntimeException("Role not found");
        }

        User organizerUser = new User().setFullName(input.getFullName()).setEmail(input.getEmail()).setPassword(passwordEncoder.encode(input.getPassword())).setRole(optionalRole.get());

        User savedUser = userRepository.save(organizerUser);

        String verificationToken = UUID.randomUUID().toString();
        savedUser.setEmailVerificationToken(verificationToken);
        sendVerificationEmail(savedUser);
        userRepository.save(savedUser);

        EventOrganizer eventOrganizer = new EventOrganizer();
        eventOrganizer.setUser(savedUser);
        eventOrganizerRepository.save(eventOrganizer);

        Company company = new Company().setName(input.getCompanyName()).setDescription(input.getCompanyDescription()).setOwner(eventOrganizer);

        companyRepository.save(company);

        eventOrganizer.setCompany(company);
        eventOrganizerRepository.save(eventOrganizer);

        if (input.getDepartmentNames() != null) {
            for (String departmentName : input.getDepartmentNames()) {
                Department department = new Department();
                department.setName(departmentName);
                department.setCompany(company);
                departmentRepository.save(department);
            }
        }

        return savedUser;
    }

    public void registerEventParticipant(@Valid EventParticipantRegisterDto input) {
        try {
            Invitation invitation = validateInvitation(input.getToken());

            if (userRepository.findByEmail(input.getEmail()).isPresent()) {
                throw new IllegalArgumentException("User already exists");
            }

            User newUser = createUser(input);
            if (newUser.getId() == null) {
                throw new RuntimeException("Failed to create user: User ID is null");
            }

            Department department = invitation.getDepartment();
            if (department == null) {
                throw new IllegalArgumentException("Department ID is required");
            }

            EventParticipant participant = new EventParticipant().setUser(newUser).setCompany(invitation.getCompany()).setAge(input.getAge()).setYearsOfExperience(input.getYearsOfExperience()).setGender(input.getGender()).setEducationLevel(input.getEducationLevel()).setOccupation(input.getOccupation()).setDepartment(department);

            eventParticipantRepository.save(participant);

            invitationService.markAsAccepted(invitation);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error during registration: " + e.getMessage());
        }
    }

    private Invitation validateInvitation(String token) {
        Invitation invitation = invitationService.getInvitation(token);
        if (invitation.isAccepted()) {
            throw new IllegalArgumentException("Invitation already accepted");
        }
        return invitation;
    }


    private EventParticipant createEventParticipant(User user, Invitation invitation) {
        EventParticipant eventParticipant = new EventParticipant().setUser(user).setCompany(invitation.getCompany());

        return eventParticipantRepository.save(eventParticipant);
    }

    private User createUser(EventParticipantRegisterDto input) {
        Role participantRole = roleRepository.findByName(RoleEnum.EVENT_PARTICIPANT).orElseThrow(() -> new RuntimeException("Role not found"));

        User newUser = new User().setEmail(input.getEmail()).setFullName(input.getName()).setPassword(passwordEncoder.encode(input.getPassword())).setRole(participantRole).setEmailVerificationToken(UUID.randomUUID().toString()).setEmailVerified(true);

        return userRepository.save(newUser);
    }

    private void sendVerificationEmail(User user) {
        String verificationUrl = "http://localhost:8080/api/auth/verify-email?token=" + user.getEmailVerificationToken();

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Email Verification");
        message.setText("Please verify your email by clicking the link below:\n" + verificationUrl);

        javaMailSender.send(message);
    }

    public User authenticate(LoginUserDto input) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getEmail(), input.getPassword()));
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userRepository.findByEmail(input.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Email not verified. Please verify your email before logging in.");
        }

        return user;
    }

    public Company getLoggedInOrganizerCompany() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

        EventOrganizer eventOrganizer = eventOrganizerRepository.findByUser(user).orElseThrow(() -> new RuntimeException("Event organizer not found"));
        Company company = eventOrganizer.getCompany();

        List<Department> departments = company.getDepartments();

        company.setDepartments(departments);

        return company;
    }
}
