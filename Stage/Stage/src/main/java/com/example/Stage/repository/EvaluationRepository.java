package com.example.Stage.repository;



import com.example.Stage.model.Evaluation;
import com.example.Stage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.text.Normalizer;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByForm(Normalizer.Form form);
    List<Evaluation> findByEvaluator(User evaluator);
    Optional<Evaluation> findByToken(String token);
}