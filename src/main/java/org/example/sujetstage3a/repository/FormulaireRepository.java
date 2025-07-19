package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.Formulaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormulaireRepository extends JpaRepository<Formulaire, Long> {
    List<Formulaire> findByCreateurId(Integer id); // Add this method
}