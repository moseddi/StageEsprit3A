package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EtudiantRepository extends JpaRepository<Etudiant, Integer> {
    List<Etudiant> findByClasseId(Integer classeId);
    boolean existsByEmail(String email);
}