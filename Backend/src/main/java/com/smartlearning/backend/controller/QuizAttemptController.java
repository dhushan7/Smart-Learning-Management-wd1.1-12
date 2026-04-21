package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.QuizAttempt;
import com.smartlearning.backend.repository.QuizAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quiz-attempts")
@CrossOrigin(origins = "*")
public class QuizAttemptController {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @PostMapping
    public ResponseEntity<QuizAttempt> saveAttempt(@RequestBody QuizAttempt attempt) {
        double percentage = ((double) attempt.getScore() / attempt.getTotalQuestions()) * 100;
        attempt.setPercentage(percentage);
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        return ResponseEntity.ok(savedAttempt);
    }

    @GetMapping("/user/{email}")
    public ResponseEntity<List<QuizAttempt>> getUserAttempts(@PathVariable String email) {
        return ResponseEntity.ok(quizAttemptRepository.findByEmail(email));
    }

    @GetMapping
    public ResponseEntity<List<QuizAttempt>> getAllAttempts() {
        return ResponseEntity.ok(quizAttemptRepository.findAll());
    }
}