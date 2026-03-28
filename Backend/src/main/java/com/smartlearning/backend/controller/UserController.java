package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.User;
import com.smartlearning.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // =========================
    // ✅ EMAIL VALIDATION
    // =========================
    private boolean isValidEmail(String email) {
        return email.matches("^[iI][tT]\\d{8}@my\\.sliit\\.lk$");
    }

    // =========================
    // ✅ REGISTER (STUDENT ONLY)
    // =========================
    @PostMapping
    public ResponseEntity<?> register(@RequestBody User newUser) {

        // Email format check
        if (!isValidEmail(newUser.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email must be like ITXXXXXXXX@my.sliit.lk");
        }

        // Email already exists
        if (userRepository.existsByEmail(newUser.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Email already exists");
        }

        // 🔥 Force role
        newUser.setRole("Student");

        User savedUser = userRepository.save(newUser);

        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // =========================
    // ✅ ADMIN CREATE USER
    // =========================
    @PostMapping("/admin/create")
    public ResponseEntity<User> createUserByAdmin(@RequestBody User newUser) {
        User savedUser = userRepository.save(newUser);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // =========================
    // ✅ LOGIN (RETURN USER OBJECT)
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> existingUser =
                userRepository.findByUsernameOrEmailAndPassword(
                        user.getUsername(),
                        user.getPassword()
                );

        if (existingUser.isPresent()) {
            return ResponseEntity.ok(existingUser.get()); // 🔥 return full user (with role)
        } else {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username/email or password");
        }
    }

    // =========================
    // ✅ GET ALL USERS
    // =========================
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // =========================
    // ✅ CHECK EMAIL
    // =========================
    @GetMapping("/check-email/{email}")
    public boolean isEmailAvailable(@PathVariable String email) {
        return !userRepository.existsByEmail(email);
    }

    // =========================
    // ✅ DELETE USER
    // =========================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        if (!userRepository.existsById(id)) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // =========================
    // ✅ UPDATE USER
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@RequestBody User newUser,
                                        @PathVariable Long id) {

        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        User user = optionalUser.get();

        // Optional: re-validate email if changed
        if (!isValidEmail(newUser.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Invalid email format");
        }

        user.setName(newUser.getName());
        user.setEmail(newUser.getEmail());
        user.setUsername(newUser.getUsername());

        // ❗ DO NOT update role here (protect it)
        // ❗ DO NOT update password here (separate endpoint later)

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}