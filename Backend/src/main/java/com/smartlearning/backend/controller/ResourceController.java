package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.Resource;
import com.smartlearning.backend.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {

    private static final Path UPLOAD_DIR = Path.of("uploads");
    private static final long MAX_UPLOAD_BYTES = 25L * 1024L * 1024L;

    @Autowired
    private ResourceRepository resourceRepository;

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    @PostMapping
    public Resource createResource(@RequestBody Resource resource) {
        return resourceRepository.save(resource);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Resource> uploadResource(
            @RequestParam("title") String title,
            @RequestParam("category") String category,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (file.getSize() > MAX_UPLOAD_BYTES) {
            return ResponseEntity.status(HttpStatusCode.valueOf(413)).build();
        }

        Files.createDirectories(UPLOAD_DIR);

        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        String storedFileName = System.currentTimeMillis() + "_" + originalName;
        Path targetPath = UPLOAD_DIR.resolve(storedFileName).normalize();

        if (!targetPath.startsWith(UPLOAD_DIR)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        Resource resource = new Resource(null, title, category, description, storedFileName);
        Resource saved = resourceRepository.save(resource);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/file/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> readUploadedFile(
            @PathVariable String fileName
    ) throws IOException {
        Path filePath = UPLOAD_DIR.resolve(fileName).normalize();

        if (!filePath.startsWith(UPLOAD_DIR)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        UrlResource fileResource = new UrlResource(filePath.toUri());
        if (!fileResource.exists()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = Files.probeContentType(filePath);
        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        if (fileName.toLowerCase().endsWith(".pdf")) {
            contentType = MediaType.APPLICATION_PDF_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileResource.getFilename() + "\"")
                .body(fileResource);
    }

    @GetMapping("/file/view/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> viewPdfInBrowser(
            @PathVariable String fileName
    ) throws IOException {
        if (!fileName.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Path filePath = UPLOAD_DIR.resolve(fileName).normalize();
        if (!filePath.startsWith(UPLOAD_DIR)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        UrlResource fileResource = new UrlResource(filePath.toUri());
        if (!fileResource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileResource.getFilename() + "\"")
                .body(fileResource);
    }
}
