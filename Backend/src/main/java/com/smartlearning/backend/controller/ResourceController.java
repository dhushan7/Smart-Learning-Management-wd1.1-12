package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.CreditTransaction;
import com.smartlearning.backend.model.Resource;
import com.smartlearning.backend.model.StudentCredit;
import com.smartlearning.backend.repository.CreditTransactionRepository;
import com.smartlearning.backend.repository.ResourceRepository;
import com.smartlearning.backend.repository.StudentCreditRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {

    private static final Path UPLOAD_DIR = Path.of("uploads");
    private static final long MAX_UPLOAD_BYTES = 25L * 1024L * 1024L;

    @Autowired private ResourceRepository resourceRepository;
    @Autowired private StudentCreditRepository studentCreditRepository;
    @Autowired private CreditTransactionRepository creditTransactionRepository;

    // ─── GET all (with optional search + filter) ─────────────────────────────
    @GetMapping
    public List<Resource> getAllResources(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false, defaultValue = "APPROVED") String status
    ) {
        List<Resource> resources = resourceRepository.findAll();

        // Status filter ("ALL" skips status filtering)
        if (!"ALL".equalsIgnoreCase(status)) {
            final String effectiveStatus = status;
            resources = resources.stream()
                    .filter(r -> effectiveStatus.equalsIgnoreCase(r.getStatus()))
                    .collect(Collectors.toList());
        }

        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            resources = resources.stream()
                    .filter(r -> r.getTitle() != null && r.getTitle().toLowerCase().contains(lower))
                    .collect(Collectors.toList());
        }

        if (category != null && !category.isBlank()) {
            resources = resources.stream()
                    .filter(r -> category.equalsIgnoreCase(r.getCategory()))
                    .collect(Collectors.toList());
        }

        if (fileType != null && !fileType.isBlank()) {
            resources = resources.stream()
                    .filter(r -> fileType.equalsIgnoreCase(r.getFileType()))
                    .collect(Collectors.toList());
        }

        return resources;
    }

    // ─── GET single resource ──────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── CREATE (JSON body, no file) ──────────────────────────────────────────
    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        if (resource.getStatus() == null) resource.setStatus("PENDING");
        if (resource.getUploadDate() == null) resource.setUploadDate(LocalDate.now());
        return resourceRepository.save(resource);
    }

    // ─── UPLOAD (multipart) ───────────────────────────────────────────────────
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> uploadResource(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", required = false, defaultValue = "user") String uploadedBy
    ) throws IOException {
        if (file.isEmpty()) return ResponseEntity.badRequest().build();
        if (file.getSize() > MAX_UPLOAD_BYTES) return ResponseEntity.status(HttpStatusCode.valueOf(413)).build();

        Files.createDirectories(UPLOAD_DIR);
        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        String storedFileName = System.currentTimeMillis() + "_" + originalName;
        Path targetPath = UPLOAD_DIR.resolve(storedFileName).normalize();
        if (!targetPath.startsWith(UPLOAD_DIR)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        String ext = originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                : "";

        Resource resource = new Resource(null, title, category, description, storedFileName, ext, uploadedBy, LocalDate.now(), "PENDING");
        return ResponseEntity.ok(resourceRepository.save(resource));
    }

    // ─── UPDATE metadata ──────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource update) {
        return resourceRepository.findById(id).map(r -> {
            if (update.getTitle() != null && !update.getTitle().isBlank()) r.setTitle(update.getTitle());
            if (update.getCategory() != null && !update.getCategory().isBlank()) r.setCategory(update.getCategory());
            if (update.getDescription() != null && !update.getDescription().isBlank()) r.setDescription(update.getDescription());
            return ResponseEntity.ok(resourceRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        return resourceRepository.findById(id).map(r -> {
            if (r.getFileUrl() != null) {
                try { Files.deleteIfExists(UPLOAD_DIR.resolve(r.getFileUrl()).normalize()); }
                catch (IOException ignored) {}
            }
            resourceRepository.delete(r);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── APPROVE / REJECT ─────────────────────────────────────────────────────
    @PutMapping("/{id}/approve")
    public ResponseEntity<Resource> approveResource(@PathVariable Long id) {
        return resourceRepository.findById(id).map(r -> {
            r.setStatus("APPROVED");
            return ResponseEntity.ok(resourceRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Resource> rejectResource(@PathVariable Long id) {
        return resourceRepository.findById(id).map(r -> {
            r.setStatus("REJECTED");
            return ResponseEntity.ok(resourceRepository.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── SERVE FILE (inline view) ─────────────────────────────────────────────
    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> readFile(@PathVariable String fileName) throws IOException {
        return serveFile(fileName, false);
    }

    @GetMapping("/file/view/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> viewPdf(@PathVariable String fileName) throws IOException {
        if (!fileName.toLowerCase().endsWith(".pdf")) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        return serveFile(fileName, false);
    }

    // ─── DOWNLOAD (triggers +2 credits) ──────────────────────────────────────
    @GetMapping("/file/download/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(
            @PathVariable String fileName,
            @RequestParam(required = false, defaultValue = "STU-2026-001") String userId
    ) throws IOException {
        awardDownloadCredits(userId, fileName);
        return serveFile(fileName, true);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────
    private ResponseEntity<org.springframework.core.io.Resource> serveFile(String fileName, boolean forceDownload) throws IOException {
        Path filePath = UPLOAD_DIR.resolve(fileName).normalize();
        if (!filePath.startsWith(UPLOAD_DIR)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();

        UrlResource fileResource = new UrlResource(filePath.toUri());
        if (!fileResource.exists()) return ResponseEntity.notFound().build();

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) contentType = "application/octet-stream";
        if (fileName.toLowerCase().endsWith(".pdf")) contentType = MediaType.APPLICATION_PDF_VALUE;

        String disposition = (forceDownload ? "attachment" : "inline") + "; filename=\"" + fileResource.getFilename() + "\"";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition)
                .body(fileResource);
    }

    private void awardDownloadCredits(String userId, String fileName) {
        try {
            StudentCredit sc = studentCreditRepository.findFirstByStudentIdOrderByIdAsc(userId)
                    .orElseGet(() -> studentCreditRepository.save(new StudentCredit(null, userId, 0)));
            sc.setTotalCredits(sc.getTotalCredits() + 2);
            studentCreditRepository.save(sc);
            creditTransactionRepository.save(
                    new CreditTransaction(null, userId, "Resource Download: " + fileName, 2, LocalDateTime.now(), "AUTO_DOWNLOAD"));
        } catch (Exception ignored) {}
    }
}
