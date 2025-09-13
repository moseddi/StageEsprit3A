package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.ReponseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReponseQuestionRepository extends JpaRepository<ReponseQuestion, Long> {
    // Récupère toutes les réponses aux questions pour une réponse formulaire
    List<ReponseQuestion> findByReponseFormulaireId(Long reponseFormulaireId);
    void deleteByReponseFormulaireId(Long reponseFormulaireId);
}
