package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.Formulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FormulaireRepository extends JpaRepository<Formulaire, Integer> {
    @Query("SELECT f FROM Formulaire f JOIN LienEvaluation l ON f.id = l.idFormulaire WHERE l.idEvaluateur = :evaluatorId")
    List<Formulaire> findFormulairesByEvaluateurId(@Param("evaluatorId") Integer evaluatorId);




}