package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.CreditTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, Long> {
    List<CreditTransaction> findByStudentIdOrderByAwardedAtDesc(String studentId);
}

