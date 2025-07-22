package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.Formulaire;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormulaireRepository extends JpaRepository<Formulaire, Integer> {
    // pas de méthodes custom nécessaires pour l’instant
}
