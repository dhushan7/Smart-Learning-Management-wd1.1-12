package com.smartlearning.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be 3–100 characters")
    private String title;

    @NotBlank(message = "Category is required")
    @Size(min = 2, max = 50, message = "Category must be 2–50 characters")
    private String category;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 500, message = "Description must be 10–500 characters")
    private String description;

    private String fileUrl;
    private String fileType;
    private String uploadedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate uploadDate;

    private String status; // PENDING, APPROVED, REJECTED
}
