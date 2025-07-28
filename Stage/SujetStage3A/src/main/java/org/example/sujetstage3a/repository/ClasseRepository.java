package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.Classe;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClasseRepository extends JpaRepository<Classe, Integer> {
    // Optional: Add custom queries if needed
    Classe findByNom(String nom);  // Example: Find class by name
}