package com.smartlearning.backend.controller;

import com.smartlearning.backend.model.UserFavourite;
import com.smartlearning.backend.repository.UserFavouriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favourites")
@CrossOrigin(origins = "http://localhost:3000")
public class UserFavouriteController {

    @Autowired
    private UserFavouriteRepository favouriteRepository;

    @GetMapping("/{userId}")
    public List<UserFavourite> getFavourites(@PathVariable String userId) {
        return favouriteRepository.findByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> addFavourite(@RequestBody UserFavourite fav) {
        if (fav.getUserId() == null || fav.getResourceId() == null)
            return ResponseEntity.badRequest().body("userId and resourceId are required");
        if (favouriteRepository.existsByUserIdAndResourceId(fav.getUserId(), fav.getResourceId()))
            return ResponseEntity.ok().body(Map.of("message", "Already a favourite"));
        return ResponseEntity.ok(favouriteRepository.save(fav));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFavourite(
            @RequestParam String userId,
            @RequestParam Long resourceId
    ) {
        favouriteRepository.deleteByUserIdAndResourceId(userId, resourceId);
        return ResponseEntity.noContent().build();
    }
}

