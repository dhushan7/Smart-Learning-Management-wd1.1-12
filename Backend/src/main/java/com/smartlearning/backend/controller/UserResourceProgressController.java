package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.UserResourceProgress;
import com.smartlearning.backend.repository.UserResourceProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000")
public class UserResourceProgressController {

    @Autowired
    private UserResourceProgressRepository progressRepository;

    @GetMapping("/{userId}")
    public List<UserResourceProgress> getProgressForUser(@PathVariable String userId) {
        return progressRepository.findByUserId(userId);
    }

    @GetMapping("/{userId}/{resourceId}")
    public ResponseEntity<UserResourceProgress> getProgress(
            @PathVariable String userId,
            @PathVariable Long resourceId
    ) {
        return progressRepository.findByUserIdAndResourceId(userId, resourceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserResourceProgress upsertProgress(@RequestBody UserResourceProgress progress) {
        return progressRepository.findByUserIdAndResourceId(progress.getUserId(), progress.getResourceId())
                .map(existing -> {
                    if (progress.getOpened() != null) existing.setOpened(progress.getOpened());
                    if (progress.getCompleted() != null) existing.setCompleted(progress.getCompleted());
                    if (progress.getProgressPercent() != null) existing.setProgressPercent(progress.getProgressPercent());
                    return progressRepository.save(existing);
                })
                .orElseGet(() -> progressRepository.save(progress));
    }
}

