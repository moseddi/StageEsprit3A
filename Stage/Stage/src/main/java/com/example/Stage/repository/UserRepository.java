package com.example.Stage.repository;



import com.example.Stage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    boolean existsByEmail(String email);

    // Custom query to find evaluators
    @Query("SELECT u FROM User u WHERE u.role = 'EVALUATOR'")
    List<User> findAllEvaluators();
    @Query("SELECT u FROM User u")
    List<User> findAllWithLogging();


}