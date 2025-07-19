package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Classe;
import org.example.sujetstage3a.repository.ClasseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClasseService {
    private final ClasseRepository classeRepository;

    public ClasseService(ClasseRepository classeRepository) {
        this.classeRepository = classeRepository;
    }

    // Create
    public Classe createClasse(String nom) {
        Classe classe = new Classe();
        classe.setNom(nom);
        return classeRepository.save(classe);
    }

    // Read
    public List<Classe> getAllClasses() {
        return classeRepository.findAll();
    }

    public Classe getClasseById(Integer id) {
        return classeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    // Update
    public Classe updateClasse(Integer id, String newNom) {
        Classe classe = getClasseById(id);
        classe.setNom(newNom);
        return classeRepository.save(classe);
    }

    // Delete
    public void deleteClasse(Integer id) {
        classeRepository.deleteById(id);
    }
}