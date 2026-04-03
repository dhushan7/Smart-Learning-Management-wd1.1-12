package com.smartlearning.backend.service;

import com.smartlearning.backend.model.User;
import com.smartlearning.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String changePassword(String email, String currentPassword, String newPassword) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // ENCORDED PASSWORD CHECK
//        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
//            throw new RuntimeException("Current password is incorrect");
//        }

        // ENCODE NEW PASSWORD
//        user.setPassword(passwordEncoder.encode(newPassword));
//        userRepository.save(user);

        // NO ENCODING
        if (!currentPassword.equals(user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Store plain password
        user.setPassword(newPassword);
        userRepository.save(user);

        return "Password updated successfully";
    }

    public User updateProfile(String email, String name, MultipartFile image) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(name);

        if (image != null && !image.isEmpty()) {

            try {
                // FILE NAME
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();

                // ABSOLUTE PATH
                String uploadDir = System.getProperty("user.dir") + "/uploads/profile/";

                File dir = new File(uploadDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                // SAVE FILE
                File destination = new File(uploadDir + fileName);
                image.transferTo(destination);

                // SAVE URL
                String imageUrl = "http://localhost:8086/uploads/profile/" + fileName;
                user.setProfileImage(imageUrl);

            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException("Image upload failed: " + e.getMessage());
            }
        }

        return userRepository.save(user);
    }
}