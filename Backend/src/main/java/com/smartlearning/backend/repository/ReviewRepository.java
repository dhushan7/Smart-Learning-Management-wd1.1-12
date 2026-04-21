package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByResourceIdAndFeedbackText(Long resourceId, String feedbackText);
    List<Review> findByResourceId(Long resourceId);
    List<Review> findByUserId(String userId);
}
