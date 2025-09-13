package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.LienEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

/*public interface LienEvaluationRepository extends JpaRepository<LienEvaluation, Long> {
    Optional<LienEvaluation> findByToken(String token);
}*/
@Repository
public interface LienEvaluationRepository extends JpaRepository<LienEvaluation, Long> {

    List<LienEvaluation> findAllByToken(String token);

    List<LienEvaluation> findAllByIdEvaluateur(Integer idEvaluateur);



}