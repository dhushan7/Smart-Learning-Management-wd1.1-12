package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.EmailOTP;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OTPRepository extends JpaRepository<EmailOTP, Long> {
    Optional<EmailOTP> findByEmail(String email);
    void deleteByEmail(String email);
}