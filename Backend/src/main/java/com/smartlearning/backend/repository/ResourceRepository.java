package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    boolean existsByTitle(String title);

    Optional<Resource> findFirstByTitle(String title);

    List<Resource> findByStatus(String status);

    List<Resource> findByTitleContainingIgnoreCase(String title);

    List<Resource> findByTitleContainingIgnoreCaseAndStatus(String title, String status);

    List<Resource> findByCategoryIgnoreCaseAndStatus(String category, String status);

    List<Resource> findByFileTypeIgnoreCaseAndStatus(String fileType, String status);

    @Modifying
    @Transactional
    @Query("UPDATE Resource r SET r.status = 'APPROVED' WHERE r.status IS NULL")
    void approveAllNullStatus();
}
