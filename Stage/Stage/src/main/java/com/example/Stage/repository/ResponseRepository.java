package com.example.Stage.repository;



import com.example.Stage.model.Evaluation;
import com.example.Stage.model.Question;
import com.example.Stage.model.Response;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResponseRepository extends JpaRepository<Response, Long> {
    boolean existsByEvaluationAndQuestion(Evaluation evaluation, Question question);
    List<Response> findByEvaluation(Evaluation evaluation);
}