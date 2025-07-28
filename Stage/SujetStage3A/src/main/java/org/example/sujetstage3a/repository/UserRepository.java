package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Native query as fallback
    @Query(value = "SELECT * FROM \"user\"", nativeQuery = true)
    List<User> findAllWithNativeQuery();

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndPassword(String email, String password);



}