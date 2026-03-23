package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.User;
import com.smartlearning.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// @RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // Safely covers both address types
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/user")
    public User newUser(@RequestBody User newUser) {
        return userRepository.save(newUser);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() { // Added 'public' access modifier here for consistency
        return userRepository.findAll();
    }

    @GetMapping("/user/check-email/{email}")
    public boolean isEmailAvailable(@PathVariable String email) {
        return !userRepository.existsByEmail(email);
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "Deleted";
    }

    @PutMapping("/users/{id}")
    public User updateUser(@RequestBody User newUser, @PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setName(newUser.getName());
                    user.setEmail(newUser.getEmail());
                    user.setUsername(newUser.getUsername());
                    return userRepository.save(user);
                }).orElseThrow();
    }
}