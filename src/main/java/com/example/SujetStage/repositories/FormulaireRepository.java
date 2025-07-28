package com.example.SujetStage.repositories;

import com.example.SujetStage.entities.Formulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormulaireRepository extends JpaRepository<Formulaire, Integer> {

    // Récupérer tous les formulaires par statut (actifs/inactifs)
    List<Formulaire> findByStatut(Boolean statut);

    // Récupérer tous les formulaires par niveau
    List<Formulaire> findByNiveau(String niveau);

    // Récupérer tous les formulaires d'une classe spécifique
    List<Formulaire> findByClasseId(Integer classeId);
}
