package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.StudentCredit;
import com.smartlearning.backend.repository.StudentCreditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/credits")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentCreditController {

    @Autowired
    private StudentCreditRepository studentCreditRepository;

    @GetMapping
    public List<StudentCredit> getAllCredits() {
        return studentCreditRepository.findAll();
    }

    @PostMapping
    public StudentCredit createOrUpdateCredit(@RequestBody StudentCredit studentCredit) {
        return studentCreditRepository.findFirstByStudentIdOrderByIdAsc(studentCredit.getStudentId())
                .map(existing -> {
                    existing.setTotalCredits(studentCredit.getTotalCredits());
                    return studentCreditRepository.save(existing);
                })
                .orElseGet(() -> studentCreditRepository.save(studentCredit));
    }
}
