package com.smartlearning.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/academic")
@PreAuthorize("hasRole('Academic Panel')")
public class AcademicController {

    @GetMapping("/dashboard")
    public String academicDashboard() {
        return "Welcome Academic Panel";
    }
}