package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE (u.username = :login OR u.email = :login) AND u.password = :password")
    Optional<User> findByUsernameOrEmailAndPassword(@Param("login") String login, @Param("password") String password);
}