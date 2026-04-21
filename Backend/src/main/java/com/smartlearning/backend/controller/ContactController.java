package com.smartlearning.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin
public class ContactController {

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping
    public ResponseEntity<?> sendEmail(@RequestBody ContactRequest request) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo("your-email@gmail.com"); // where you receive
        message.setSubject("New Contact Message");

        // This will now work because ContactRequest is a defined class below
        message.setText(
                "Name: " + request.getName() +
                        "\nEmail: " + request.getEmail() +
                        "\nMessage: " + request.getMessage()
        );

        mailSender.send(message);

        return ResponseEntity.ok("Email sent");
    }
}

// Separate class to hold the incoming request data
class ContactRequest {
    private String name;
    private String email;
    private String message;

    // GETTERS
    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getMessage() {
        return message;
    }

    // SETTERS
    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}