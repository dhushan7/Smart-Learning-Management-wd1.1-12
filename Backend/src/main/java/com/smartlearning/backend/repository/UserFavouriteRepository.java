package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.UserFavourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserFavouriteRepository extends JpaRepository<UserFavourite, Long> {
    List<UserFavourite> findByUserId(String userId);
    boolean existsByUserIdAndResourceId(String userId, Long resourceId);

    @Transactional
    void deleteByUserIdAndResourceId(String userId, Long resourceId);
}

