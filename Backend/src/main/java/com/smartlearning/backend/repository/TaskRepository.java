package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByCompletedFalse();

    List<Task> findByDueDate(LocalDate date);

    List<Task> findByOwnerEmail(String email);

    @Query("SELECT DISTINCT t.ownerEmail FROM Task t")
    List<String> findAllDistinctUserEmails();
}