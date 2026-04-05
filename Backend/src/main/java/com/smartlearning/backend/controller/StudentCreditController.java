package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.CreditTransaction;
import com.smartlearning.backend.model.StudentCredit;
import com.smartlearning.backend.repository.CreditTransactionRepository;
import com.smartlearning.backend.repository.StudentCreditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/credits")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentCreditController {

    @Autowired private StudentCreditRepository studentCreditRepository;
    @Autowired private CreditTransactionRepository creditTransactionRepository;

    // ─── Get all credit records ───────────────────────────────────────────────
    @GetMapping
    public List<StudentCredit> getAllCredits() {
        return studentCreditRepository.findAll();
    }

    // ─── Get total credits for one student ───────────────────────────────────
    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentCredit> getByStudentId(@PathVariable String studentId) {
        return studentCreditRepository.findFirstByStudentIdOrderByIdAsc(studentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(new StudentCredit(null, studentId, 0)));
    }

    // ─── Get credit history for one student ──────────────────────────────────
    @GetMapping("/history/{studentId}")
    public List<CreditTransaction> getCreditHistory(@PathVariable String studentId) {
        return creditTransactionRepository.findByStudentIdOrderByAwardedAtDesc(studentId);
    }

    // ─── Award credits (admin or system) ─────────────────────────────────────
    @PostMapping("/award")
    public ResponseEntity<?> awardCredits(@RequestBody Map<String, Object> body) {
        String studentId = (String) body.get("studentId");
        String activity = (String) body.get("activity");
        Object creditsObj = body.get("credits");

        if (studentId == null || studentId.isBlank()) return ResponseEntity.badRequest().body("studentId is required");
        if (activity == null || activity.isBlank()) return ResponseEntity.badRequest().body("activity is required");
        if (creditsObj == null) return ResponseEntity.badRequest().body("credits is required");

        int credits;
        try {
            credits = Integer.parseInt(creditsObj.toString());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("credits must be a valid integer");
        }
        if (credits <= 0) return ResponseEntity.badRequest().body("credits must be a positive value");

        // Update or create StudentCredit total
        StudentCredit sc = studentCreditRepository.findFirstByStudentIdOrderByIdAsc(studentId)
                .orElseGet(() -> studentCreditRepository.save(new StudentCredit(null, studentId, 0)));
        sc.setTotalCredits(sc.getTotalCredits() + credits);
        studentCreditRepository.save(sc);

        // Record transaction
        CreditTransaction tx = new CreditTransaction(null, studentId, activity, credits, LocalDateTime.now(), "MANUAL");
        CreditTransaction saved = creditTransactionRepository.save(tx);
        return ResponseEntity.ok(saved);
    }

    // ─── Legacy upsert endpoint (kept for backward compatibility) ────────────
    @PostMapping
    public StudentCredit createOrUpdateCredit(@RequestBody StudentCredit studentCredit) {
        return studentCreditRepository.findFirstByStudentIdOrderByIdAsc(studentCredit.getStudentId())
                .map(existing -> {
                    existing.setTotalCredits(studentCredit.getTotalCredits());
                    return studentCreditRepository.save(existing);
                })
                .orElseGet(() -> studentCreditRepository.save(studentCredit));
    }

    // ─── Update credit record ─────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<StudentCredit> updateCredit(@PathVariable Long id, @RequestBody StudentCredit update) {
        if (update.getTotalCredits() == null || update.getTotalCredits() < 0)
            return ResponseEntity.badRequest().build();
        return studentCreditRepository.findById(id).map(sc -> {
            sc.setTotalCredits(update.getTotalCredits());
            return ResponseEntity.ok(studentCreditRepository.save(sc));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Delete credit record ─────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCredit(@PathVariable Long id) {
        if (!studentCreditRepository.existsById(id)) return ResponseEntity.notFound().build();
        studentCreditRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Update a credit transaction ──────────────────────────────────────────
    @PutMapping("/transaction/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String activity = (String) body.get("activity");
        Object creditsObj = body.get("credits");

        if (activity == null || activity.isBlank()) return ResponseEntity.badRequest().body("activity is required");
        if (creditsObj == null) return ResponseEntity.badRequest().body("credits is required");
        int newCredits;
        try { newCredits = Integer.parseInt(creditsObj.toString()); }
        catch (NumberFormatException e) { return ResponseEntity.badRequest().body("credits must be a valid integer"); }
        if (newCredits <= 0) return ResponseEntity.badRequest().body("credits must be positive");

        return creditTransactionRepository.findById(id).map(tx -> {
            int diff = newCredits - tx.getCredits();
            tx.setActivity(activity);
            tx.setCredits(newCredits);
            creditTransactionRepository.save(tx);

            // Adjust total
            studentCreditRepository.findFirstByStudentIdOrderByIdAsc(tx.getStudentId()).ifPresent(sc -> {
                sc.setTotalCredits(Math.max(0, sc.getTotalCredits() + diff));
                studentCreditRepository.save(sc);
            });
            return ResponseEntity.ok(tx);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Delete a credit transaction ──────────────────────────────────────────
    @DeleteMapping("/transaction/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        return creditTransactionRepository.findById(id).map(tx -> {
            // Deduct from total
            studentCreditRepository.findFirstByStudentIdOrderByIdAsc(tx.getStudentId()).ifPresent(sc -> {
                sc.setTotalCredits(Math.max(0, sc.getTotalCredits() - tx.getCredits()));
                studentCreditRepository.save(sc);
            });
            creditTransactionRepository.delete(tx);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
