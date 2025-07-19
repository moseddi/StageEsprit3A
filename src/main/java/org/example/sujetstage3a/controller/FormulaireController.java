package org.example.sujetstage3a.controller;
import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formulaires")
public class FormulaireController {

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private FormulaireRepository formulaireRepository; // Inject the repository

    @PostMapping
    public ResponseEntity<Formulaire> createFormulaire(
            @RequestBody Formulaire formulaire,
            @RequestHeader("X-User-Id") Integer createurId) { // Use custom header
        if (createurId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Formulaire savedFormulaire = evaluationService.createFormulaire(formulaire, createurId);
        return ResponseEntity.ok(savedFormulaire);
    }
    @PutMapping("/{id}")
    public ResponseEntity<Formulaire> updateFormulaire(@PathVariable Long id, @RequestBody Formulaire formulaire) {
        Formulaire updatedFormulaire = evaluationService.updateFormulaire(id, formulaire);
        return ResponseEntity.ok(updatedFormulaire);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormulaire(@PathVariable Long id) {
        evaluationService.deleteFormulaire(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<Formulaire>> getFormulaires(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Formulaire> formulaires = evaluationService.getFormulaires(page, size);
        return ResponseEntity.ok(formulaires);
    }

    @GetMapping("/evaluator/{id}")
    public ResponseEntity<List<Formulaire>> getFormulairesByEvaluator(@PathVariable Integer id) {
        // Fetch forms where the evaluator is the creator (simplified logic)
        List<Formulaire> formulaires = formulaireRepository.findByCreateurId(id);
        return ResponseEntity.ok(formulaires);
    }

    private Integer extractUserIdFromAuth(String authHeader) {
        // Decode Basic Auth and extract user ID (simplified)
        // In production, use Spring Security
        return 1; // Placeholder
    }

}