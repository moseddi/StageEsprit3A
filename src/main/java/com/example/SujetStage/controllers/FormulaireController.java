package com.example.SujetStage.controllers;

import com.example.SujetStage.entities.Formulaire;
import com.example.SujetStage.services.FormulaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/formulaires")
@CrossOrigin(origins = "http://localhost:3000") // autoriser le frontend React
public class FormulaireController {

    @Autowired
    private FormulaireService formulaireService;

    // Récupérer tous les formulaires
    @GetMapping
    public List<Formulaire> getAllFormulaires() {
        return formulaireService.getAllFormulaires();
    }

    // Récupérer un formulaire par ID
    @GetMapping("/{id}")
    public ResponseEntity<Formulaire> getFormulaireById(@PathVariable Integer id) {
        Optional<Formulaire> formulaire = formulaireService.getFormulaireById(id);
        return formulaire.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Créer un formulaire (réservé Admin)
    @PostMapping
    public ResponseEntity<Formulaire> createFormulaire(@RequestBody Formulaire formulaire) {
        return ResponseEntity.ok(formulaireService.createFormulaire(formulaire));
    }

    // Mettre à jour un formulaire (par ID)
    @PutMapping("/{id}")
    public ResponseEntity<Formulaire> updateFormulaire(@PathVariable Integer id, @RequestBody Formulaire formulaire) {
        return formulaireService.updateFormulaire(id, formulaire)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Supprimer un formulaire
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormulaire(@PathVariable Integer id) {
        if (formulaireService.deleteFormulaire(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Filtrer par statut (actif/inactif)
    @GetMapping("/statut/{statut}")
    public List<Formulaire> getFormulairesByStatut(@PathVariable Boolean statut) {
        return formulaireService.getFormulairesByStatut(statut);
    }

    // Filtrer par niveau
    @GetMapping("/niveau/{niveau}")
    public List<Formulaire> getFormulairesByNiveau(@PathVariable String niveau) {
        return formulaireService.getFormulairesByNiveau(niveau);
    }

    // Filtrer par classe
    @GetMapping("/classe/{classeId}")
    public List<Formulaire> getFormulairesByClasse(@PathVariable Integer classeId) {
        return formulaireService.getFormulairesByClasse(classeId);
    }
}
