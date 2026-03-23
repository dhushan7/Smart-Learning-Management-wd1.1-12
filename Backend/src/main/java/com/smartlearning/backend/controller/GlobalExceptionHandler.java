package com.smartlearning.backend.controller;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ignored) {
        return ResponseEntity.status(HttpStatusCode.valueOf(413))
                .body(Map.of(
                        "error", "FILE_TOO_LARGE",
                        "message", "Uploaded file exceeds the allowed size limit of 25MB."
                ));
    }
}


