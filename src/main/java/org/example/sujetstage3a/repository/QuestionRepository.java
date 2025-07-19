package org.example.sujetstage3a.repository;


import org.example.sujetstage3a.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByFormulaireId(Long formulaireId);
}