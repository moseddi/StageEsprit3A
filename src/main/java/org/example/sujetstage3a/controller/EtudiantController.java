package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Etudiant;
import org.example.sujetstage3a.service.EtudiantService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/etudiants")
public class EtudiantController {
    private final EtudiantService etudiantService;

    public EtudiantController(EtudiantService etudiantService) {
        this.etudiantService = etudiantService;
    }

    @GetMapping
    public List<Etudiant> getAllEtudiants() {
        return etudiantService.getAllEtudiants();
    }

    @GetMapping("/{id}")
    public Etudiant getEtudiantById(@PathVariable Integer id) {
        return etudiantService.getEtudiantById(id);
    }

    @PostMapping
    public Etudiant createEtudiant(@RequestBody Etudiant etudiant) {
        return etudiantService.createEtudiant(etudiant);
    }

    @PutMapping("/{id}")
    public Etudiant updateEtudiant(@PathVariable Integer id, @RequestBody Etudiant etudiant) {
        return etudiantService.updateEtudiant(id, etudiant);
    }

    @DeleteMapping("/{id}")
    public void deleteEtudiant(@PathVariable Integer id) {
        etudiantService.deleteEtudiant(id);
    }

    @GetMapping("/by-classe/{classeId}")
    public List<Etudiant> getEtudiantsByClasse(@PathVariable Integer classeId) {
        return etudiantService.getEtudiantsByClasse(classeId);
    }
}