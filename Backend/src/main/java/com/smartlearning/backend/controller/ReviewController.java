package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.Review;
import com.smartlearning.backend.repository.ReviewRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @GetMapping("/resource/{resourceId}")
    public List<Review> getByResource(@PathVariable Long resourceId) {
        return reviewRepository.findByResourceId(resourceId);
    }

    @PostMapping
    public Review createReview(@Valid @RequestBody Review review) {
        if (review.getCreatedAt() == null) review.setCreatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable Long id, @RequestBody Review update) {
        return reviewRepository.findById(id).map(review -> {
            if (update.getRating() != null && update.getRating() >= 1 && update.getRating() <= 5)
                review.setRating(update.getRating());
            if (update.getFeedbackText() != null && !update.getFeedbackText().isBlank())
                review.setFeedbackText(update.getFeedbackText());
            return ResponseEntity.ok(reviewRepository.save(review));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) return ResponseEntity.notFound().build();
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
