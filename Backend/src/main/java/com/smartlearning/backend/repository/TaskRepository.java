package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCompletedFalse();
    List<Task> findByDueDate(LocalDate date);
}