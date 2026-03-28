package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.User;
import com.smartlearning.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.smartlearning.backend.model.EmailOTP;
import com.smartlearning.backend.repository.OTPRepository;
import com.smartlearning.backend.service.EmailService;

import java.time.LocalDateTime;

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

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOTP(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (!isValidEmail(email)) {
            return ResponseEntity.badRequest().body("Invalid email format");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        String otp = String.valueOf(new Random().nextInt(900000) + 100000);

        EmailOTP emailOTP = new EmailOTP();
        emailOTP.setEmail(email);
        emailOTP.setOtp(otp);
        emailOTP.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        otpRepository.deleteByEmail(email); // remove old OTP
        otpRepository.save(emailOTP);

        emailService.sendOTP(email, otp);

        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/verify-otp-register")
    public ResponseEntity<?> verifyOTPAndRegister(@RequestBody Map<String, String> request) {

        String email = request.get("email");
        String otp = request.get("otp");

        Optional<EmailOTP> stored = otpRepository.findByEmail(email);

        if (stored.isEmpty()) {
            return ResponseEntity.badRequest().body("OTP not found");
        }

        EmailOTP record = stored.get();

        if (!record.getOtp().equals(otp)) {
            return ResponseEntity.badRequest().body("Invalid OTP");
        }

        if (record.getExpiryTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("OTP expired");
        }

        // ✅ create user
        User user = new User();
        user.setUsername(request.get("username"));
        user.setName(request.get("name"));
        user.setEmail(email);
        user.setPassword(request.get("password"));
        user.setRole("Student");

        userRepository.save(user);

        otpRepository.deleteByEmail(email);

        return ResponseEntity.ok("Registration successful");
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