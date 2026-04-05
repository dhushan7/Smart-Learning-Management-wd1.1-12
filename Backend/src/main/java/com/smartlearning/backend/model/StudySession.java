package com.smartlearning.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 100, message = "Title must be 3–100 characters")
    private String title;

    @Size(max = 500, message = "Description must be 500 characters or fewer")
    private String description;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate sessionDate;

    private String sessionTime;

    @NotBlank(message = "Meeting link is required")
    @Pattern(regexp = "https?://.*", message = "Meeting link must start with http or https")
    private String meetingLink;

    private String createdBy;
    private String status; // UPCOMING, ACTIVE, COMPLETED

    @Column(length = 2000)
    private String attendees; // comma-separated user IDs
}
