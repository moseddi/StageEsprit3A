package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.LienEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LienEvaluationRepository extends JpaRepository<LienEvaluation, Integer> {
    Optional<LienEvaluation> findByToken(String token);
}


