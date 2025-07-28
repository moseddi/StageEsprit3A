package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Etudiant;
import org.example.sujetstage3a.repository.EtudiantRepository;
import org.example.sujetstage3a.repository.ClasseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EtudiantService {
    private final EtudiantRepository etudiantRepository;
    private final ClasseRepository classeRepository;

    public EtudiantService(EtudiantRepository etudiantRepository,
                           ClasseRepository classeRepository) {
        this.etudiantRepository = etudiantRepository;
        this.classeRepository = classeRepository;
    }

    public List<Etudiant> getAllEtudiants() {
        return etudiantRepository.findAll();
    }

    public Etudiant getEtudiantById(Integer id) {
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    public Etudiant createEtudiant(Etudiant etudiant) {
        if (etudiantRepository.existsByEmail(etudiant.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return etudiantRepository.save(etudiant);
    }

    public Etudiant updateEtudiant(Integer id, Etudiant etudiantDetails) {
        Etudiant etudiant = getEtudiantById(id);
        etudiant.setNom(etudiantDetails.getNom());
        etudiant.setEmail(etudiantDetails.getEmail());
        etudiant.setClasse(etudiantDetails.getClasse());
        return etudiantRepository.save(etudiant);
    }

    public void deleteEtudiant(Integer id) {
        etudiantRepository.deleteById(id);
    }

    public List<Etudiant> getEtudiantsByClasse(Integer classeId) {
        return etudiantRepository.findByClasseId(classeId);
    }
}