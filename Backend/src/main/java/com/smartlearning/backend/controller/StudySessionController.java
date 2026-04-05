package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.StudySession;
import com.smartlearning.backend.repository.StudySessionRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "http://localhost:3000")
public class StudySessionController {

    @Autowired
    private StudySessionRepository studySessionRepository;

    @GetMapping
    public List<StudySession> getAllSessions() {
        return studySessionRepository.findAllByOrderBySessionDateAsc();
    }

    @GetMapping("/upcoming")
    public List<StudySession> getUpcomingSessions() {
        return studySessionRepository.findBySessionDateGreaterThanEqualOrderBySessionDateAsc(LocalDate.now());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudySession> getById(@PathVariable Long id) {
        return studySessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createSession(@Valid @RequestBody StudySession session) {
        if (session.getTitle() == null || session.getTitle().isBlank())
            return ResponseEntity.badRequest().body("Title is required");
        if (session.getSessionDate() == null)
            return ResponseEntity.badRequest().body("Session date is required");
        if (session.getSessionDate().isBefore(LocalDate.now()))
            return ResponseEntity.badRequest().body("Session date cannot be in the past");
        if (session.getMeetingLink() == null || session.getMeetingLink().isBlank())
            return ResponseEntity.badRequest().body("Meeting link is required");

        if (session.getStatus() == null) session.setStatus("UPCOMING");
        if (session.getAttendees() == null) session.setAttendees("");
        return ResponseEntity.ok(studySessionRepository.save(session));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSession(@PathVariable Long id, @RequestBody StudySession update) {
        return studySessionRepository.findById(id).map(s -> {
            if (update.getTitle() != null && !update.getTitle().isBlank()) s.setTitle(update.getTitle());
            if (update.getDescription() != null) s.setDescription(update.getDescription());
            if (update.getSessionDate() != null) s.setSessionDate(update.getSessionDate());
            if (update.getSessionTime() != null) s.setSessionTime(update.getSessionTime());
            if (update.getMeetingLink() != null && !update.getMeetingLink().isBlank()) s.setMeetingLink(update.getMeetingLink());
            if (update.getStatus() != null) s.setStatus(update.getStatus());
            return ResponseEntity.ok(studySessionRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        if (!studySessionRepository.existsById(id)) return ResponseEntity.notFound().build();
        studySessionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinSession(@PathVariable Long id, @RequestParam String userId) {
        return studySessionRepository.findById(id).map(s -> {
            String existing = s.getAttendees() == null ? "" : s.getAttendees();
            List<String> list = new ArrayList<>(
                    existing.isBlank() ? List.of() : Arrays.asList(existing.split(","))
            );
            if (list.contains(userId)) return ResponseEntity.ok(s); // already joined
            list.add(userId);
            s.setAttendees(String.join(",", list));
            return ResponseEntity.ok(studySessionRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveSession(@PathVariable Long id, @RequestParam String userId) {
        return studySessionRepository.findById(id).map(s -> {
            String existing = s.getAttendees() == null ? "" : s.getAttendees();
            List<String> list = new ArrayList<>(
                    existing.isBlank() ? List.of() : Arrays.asList(existing.split(","))
            );
            list.remove(userId);
            s.setAttendees(String.join(",", list));
            return ResponseEntity.ok(studySessionRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }
}

