package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.UserResourceProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserResourceProgressRepository extends JpaRepository<UserResourceProgress, Long> {
    Optional<UserResourceProgress> findByUserIdAndResourceId(String userId, Long resourceId);
    List<UserResourceProgress> findByUserId(String userId);
}

