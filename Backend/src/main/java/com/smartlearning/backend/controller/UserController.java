package com.smartlearning.backend.controller;

import com.smartlearning.backend.dto.ChangePasswordRequest;
import com.smartlearning.backend.model.User;
import com.smartlearning.backend.repository.UserRepository;
import com.smartlearning.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.smartlearning.backend.model.EmailOTP;
import com.smartlearning.backend.repository.OTPRepository;
import com.smartlearning.backend.service.EmailService;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

import java.util.*;

@RestController
@RequestMapping("/user")


public class UserController {

    @Autowired
    private UserRepository userRepository;

    // email validation
    private boolean isValidEmail(String email) {
        return email.matches("^[iI][tT]\\d{8}@my\\.sliit\\.lk$");
    }

    // register (std only)


    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {

        boolean exists = userRepository.existsByUsername(username);

        if (exists) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username already exists");
        }

        return ResponseEntity.ok("Username available");
    }

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

        // USERNAME CHECK ADDED
        if (newUser.getUsername() == null || newUser.getUsername().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username is required");
        }

        if (userRepository.existsByUsername(newUser.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Username already exists");
        }

        // Force role
        newUser.setRole("Student");
//        newUser.setPassword(passwordEncoder.encode(newUser.getPassword()));
        User savedUser = userRepository.save(newUser);

        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Transactional
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOTP(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

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

        try {
            otpRepository.deleteByEmail(email);
            otpRepository.save(emailOTP);

            emailService.sendOTP(email, otp);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("OTP process failed: " + e.getMessage());
        }

        return ResponseEntity.ok("OTP sent successfully");
    }

    @Transactional
    @PostMapping("/verify-otp-register")
    public ResponseEntity<?> verifyOTPAndRegister(@RequestBody Map<String, String> request) {

        System.out.println("REQUEST: " + request); // For debugging

        String email = request.get("email");
        String otp = request.get("otp");

        // Validate input
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body("Missing email or OTP");
        }

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

        // Check required fields
        String username = request.get("username");
        String name = request.get("name");
        String password = request.get("password");

        if (username == null || name == null || password == null) {
            return ResponseEntity.badRequest().body("Missing registration data");
        }

        // check duplicate email
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // username validation
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username required");
        }

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        // reate user
        User user = new User();
        user.setUsername(username);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole("Student");

        userRepository.save(user);

        otpRepository.deleteByEmail(email);

        return ResponseEntity.ok("Registration successful");
    }


    // admin create users
    @PostMapping("/admin/create")
    public ResponseEntity<?> createUserByAdmin(@RequestBody User newUser) {

        if (userRepository.existsByEmail(newUser.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        if (userRepository.existsByUsername(newUser.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (newUser.getPassword() == null || newUser.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }

        User savedUser = userRepository.save(newUser);
        return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
    }

    // login
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String login = request.get("login");
        String password = request.get("password");

        if (login == null || password == null) {
            return ResponseEntity.badRequest()
                    .body("Login and password required");
        }

        Optional<User> existingUser = userRepository.findByLogin(login);

        if (existingUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        User dbUser = existingUser.get();
//        if (!passwordEncoder.matches(password, dbUser.getPassword())) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                    .body("Invalid password");
//        }
        if (!password.equals(dbUser.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid password");
        }

        return ResponseEntity.ok(Map.of(
                "username", dbUser.getUsername(),
                "email", dbUser.getEmail(),
                "role", dbUser.getRole()
        ));
    }

    // PROFILE
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam(required = false) String email) {

        try {
            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body("Email is required");
            }

            Optional<User> optionalUser = userRepository.findByEmail(email);

            if (optionalUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
            }

            User user = optionalUser.get();

            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("role", user.getRole());
            response.put("profileImage",
                    user.getProfileImage() != null ? user.getProfileImage() : "");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Server error: " + e.getMessage());
        }
    }


    // ADMIN PROFILE UPDATE
    @PutMapping("/admin/update-profile")
    public ResponseEntity<?> adminUpdateProfile(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam(required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(
                userService.updateProfile(email, name, image)
        );
    }


    // ACADEMIC PANEL PROFILE UPDATE
    @PutMapping("/academic/update-profile")
    public ResponseEntity<?> academicUpdateProfile(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam(required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(
                userService.updateProfile(email, name, image)
        );
    }
    
    @Autowired
    private UserService userService;


    // CHANGE PASSWORD
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {

        if (request.getEmail() == null ||
                request.getCurrentPassword() == null ||
                request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body("Missing password data");
        }

        try {
            String result = userService.changePassword(
                    request.getEmail(),
                    request.getCurrentPassword(),
                    request.getNewPassword()
            );

            return ResponseEntity.ok(Map.of("message", result));

        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", ex.getMessage()));
        }
    }

    // get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }


    // email checking
    @GetMapping("/check-email/{email}")
    public boolean isEmailAvailable(@PathVariable String email) {
        return !userRepository.existsByEmail(email);
    }


    // delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {

        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        User target = optionalUser.get();
        userRepository.deleteById(id);

        return ResponseEntity.ok("User deleted successfully");
    }


    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam String email,
            @RequestParam String name,
            @RequestParam(required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(userService.updateProfile(email, name, image));
    }

    // user update
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@RequestBody User newUser,
                                        @PathVariable Long id) {

        Optional<User> optionalUser = userRepository.findById(id);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        User user = optionalUser.get();

        // Admin cannot update STUDENT
        if ("Student".equalsIgnoreCase(user.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Admin cannot update student details");
        }

        //allow only valid emails
//        if (!isValidEmail(newUser.getEmail())) {
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
//                    .body("Invalid email format");
//        }

        //allowed updates (Admin and Academic Panel only)
        user.setName(newUser.getName());
        user.setEmail(newUser.getEmail());
        user.setUsername(newUser.getUsername());
        user.setRole(newUser.getRole());

        userRepository.save(user);

        return ResponseEntity.ok(user);
    }
}