package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.ReponseQuestion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReponseQuestionRepository extends JpaRepository<ReponseQuestion, Integer> {

    @EntityGraph(attributePaths = {"question"})
    @Query("SELECT r FROM ReponseQuestion r WHERE r.id = :id")
    Optional<ReponseQuestion> findByIdWithQuestion(@Param("id") Integer id);
    List<ReponseQuestion> findByQuestion_Formulaire_Id(Integer formulaireId);
    @EntityGraph(attributePaths = {"question"})
    @Query("SELECT r FROM ReponseQuestion r WHERE r.question.formulaire.id = :formId")
    List<ReponseQuestion> findByFormIdWithQuestions(@Param("formId") Integer formId);
}