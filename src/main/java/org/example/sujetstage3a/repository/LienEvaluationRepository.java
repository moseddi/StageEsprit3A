package org.example.sujetstage3a.repository;



import org.example.sujetstage3a.model.LienEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LienEvaluationRepository extends JpaRepository<LienEvaluation, Long> {
    LienEvaluation findByToken(String token);
}

