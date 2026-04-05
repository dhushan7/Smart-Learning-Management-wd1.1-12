package com.smartlearning.backend.config;

import com.smartlearning.backend.model.Resource;
import com.smartlearning.backend.model.Review;
import com.smartlearning.backend.model.StudentCredit;
import com.smartlearning.backend.repository.ResourceRepository;
import com.smartlearning.backend.repository.ReviewRepository;
import com.smartlearning.backend.repository.StudentCreditRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Configuration
public class DataSeederConfig {

    @Bean
    CommandLineRunner seedDatabase(
            ResourceRepository resourceRepository,
            ReviewRepository reviewRepository,
            StudentCreditRepository studentCreditRepository
    ) {
        return args -> {
            // Migrate any existing resources that have no status to APPROVED
            resourceRepository.approveAllNullStatus();

            Resource r1 = resourceRepository.findFirstByTitle("ITPM Chapter 3")
                .orElseGet(() -> resourceRepository.save(new Resource(
                    null,
                    "ITPM Chapter 3",
                    "Project Management",
                    "Lecture slides with sprint planning and velocity examples.",
                    "itpm-chapter-3.pdf",
                    "pdf",
                    "system",
                    LocalDate.of(2026, 1, 10),
                    "APPROVED"
                )));

            Resource r2 = resourceRepository.findFirstByTitle("SE Workshop Guide")
                .orElseGet(() -> resourceRepository.save(new Resource(
                    null,
                    "SE Workshop Guide",
                    "Software Engineering",
                    "Practical worksheet for requirement elicitation and UML.",
                    "se-workshop-guide.docx",
                    "docx",
                    "system",
                    LocalDate.of(2026, 1, 15),
                    "APPROVED"
                )));

            Resource r3 = resourceRepository.findFirstByTitle("DBMS Week 4 Notes")
                .orElseGet(() -> resourceRepository.save(new Resource(
                    null,
                    "DBMS Week 4 Notes",
                    "Database",
                    "Normalization walkthrough with SQL practice exercises.",
                    "dbms-week4-notes.pdf",
                    "pdf",
                    "system",
                    LocalDate.of(2026, 1, 20),
                    "APPROVED"
                )));

            if (!reviewRepository.existsByResourceIdAndFeedbackText(r1.getId(), "Great resource! Very clear examples.")) {
                reviewRepository.save(new Review(null, r1.getId(), 5, "Great resource! Very clear examples.", "STU-2026-001", LocalDateTime.now()));
            }

            if (!reviewRepository.existsByResourceIdAndFeedbackText(r2.getId(), "Useful workshop guide with practical steps.")) {
                reviewRepository.save(new Review(null, r2.getId(), 4, "Useful workshop guide with practical steps.", "STU-2026-001", LocalDateTime.now()));
            }

            if (!reviewRepository.existsByResourceIdAndFeedbackText(r3.getId(), "Excellent summary for revision before quiz.")) {
                reviewRepository.save(new Review(null, r3.getId(), 5, "Excellent summary for revision before quiz.", "STU-2026-001", LocalDateTime.now()));
            }

            String seededStudentId = "STU-2026-001";
            List<StudentCredit> studentCredits = studentCreditRepository.findAllByStudentIdOrderByIdAsc(seededStudentId);

            if (studentCredits.isEmpty()) {
                studentCreditRepository.save(new StudentCredit(null, seededStudentId, 30));
            } else if (studentCredits.size() > 1) {
                StudentCredit canonicalCredit = studentCredits.get(0);
                int maxCredits = studentCredits.stream()
                        .map(StudentCredit::getTotalCredits)
                        .filter(Objects::nonNull)
                        .max(Integer::compareTo)
                        .orElse(0);

                if (!Objects.equals(canonicalCredit.getTotalCredits(), maxCredits)) {
                    canonicalCredit.setTotalCredits(maxCredits);
                    studentCreditRepository.save(canonicalCredit);
                }

                studentCreditRepository.deleteAll(studentCredits.subList(1, studentCredits.size()));
            }
        };
    }
}
