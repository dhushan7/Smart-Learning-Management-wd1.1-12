package com.smartlearning.backend.repository;

import com.smartlearning.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
	boolean existsByTitle(String title);

	Optional<Resource> findFirstByTitle(String title);
}
