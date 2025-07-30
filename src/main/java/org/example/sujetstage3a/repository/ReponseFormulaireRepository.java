package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.ReponseFormulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ReponseFormulaireRepository extends JpaRepository<ReponseFormulaire, Long> {
}