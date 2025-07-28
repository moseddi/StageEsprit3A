package com.example.SujetStage.repositories;

import com.example.SujetStage.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Integer> {

    // Optionnel : récupérer les étudiants avec la classe jointe en une requête (évite lazy loading)
    @Query("SELECT e FROM Etudiant e LEFT JOIN FETCH e.classe")
    List<Etudiant> findAllWithClasse();
}
