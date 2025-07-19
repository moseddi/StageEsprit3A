package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Classe;
import org.example.sujetstage3a.service.ClasseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/classes")
public class ClasseController {
    private final ClasseService classeService;

    public ClasseController(ClasseService classeService) {
        this.classeService = classeService;
    }

    // Création (POST)
    @PostMapping
    public Classe createClasse(@RequestBody Classe classe) { // Changé pour @RequestBody Classe classe
        return classeService.createClasse(classe.getNom()); // Extrayez 'nom' de l'objet reçu
    }

    // Read (GET)
    @GetMapping
    public List<Classe> getAllClasses() {
        return classeService.getAllClasses();
    }

    @GetMapping("/{id}")
    public Classe getClasseById(@PathVariable Integer id) {
        return classeService.getClasseById(id);
    }

    // Update (PUT)
    @PutMapping("/{id}")
    public Classe updateClasse(
            @PathVariable Integer id,
            @RequestParam String nom
    ) {
        return classeService.updateClasse(id, nom);
    }

    // Delete (DELETE)
    @DeleteMapping("/{id}")
    public void deleteClasse(@PathVariable Integer id) {
        classeService.deleteClasse(id);
    }
}