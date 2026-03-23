package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	boolean existsByResourceIdAndFeedbackText(Long resourceId, String feedbackText);
}
