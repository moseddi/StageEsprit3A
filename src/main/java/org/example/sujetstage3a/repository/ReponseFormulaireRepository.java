package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.ReponseFormulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
/*@Repository
public interface ReponseFormulaireRepository extends JpaRepository<ReponseFormulaire, Long> {

    // Récupère toutes les réponses d’un utilisateur (évaluateur)
    List<ReponseFormulaire> findByIdUtilisateur(Integer userId);

    // Compte combien de formulaires distincts sont remplis par l’utilisateur
    @Query("SELECT COUNT(DISTINCT r.idFormulaire) FROM ReponseFormulaire r " +
            "WHERE r.idUtilisateur = :userId AND r.idFormulaire IN :idFormulaires")
    long countFilledForms(@Param("userId") Integer userId,
                          @Param("idFormulaires") List<Integer> idFormulaires);
}*/
@Repository
public interface ReponseFormulaireRepository extends JpaRepository<ReponseFormulaire, Long> {

    // 🔹 Récupère toutes les réponses d’un utilisateur (évaluateur)
    @Query("SELECT DISTINCT rf FROM ReponseFormulaire rf " +
            "LEFT JOIN FETCH rf.reponsesQuestions rq " +
            "WHERE rf.idUtilisateur = :userId")
    List<ReponseFormulaire> findByIdUtilisateur(@Param("userId") Integer userId);

    // 🔹 Compte combien de formulaires distincts sont remplis par l’utilisateur
    @Query("SELECT COUNT(DISTINCT r.idFormulaire) FROM ReponseFormulaire r " +
            "WHERE r.idUtilisateur = :userId AND r.idFormulaire IN :idFormulaires")
    long countFilledForms(@Param("userId") Integer userId,
                          @Param("idFormulaires") List<Integer> idFormulaires);
}
