package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.StudentCredit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentCreditRepository extends JpaRepository<StudentCredit, Long> {
	boolean existsByStudentId(String studentId);
	Optional<StudentCredit> findFirstByStudentIdOrderByIdAsc(String studentId);
	List<StudentCredit> findAllByStudentIdOrderByIdAsc(String studentId);
}
