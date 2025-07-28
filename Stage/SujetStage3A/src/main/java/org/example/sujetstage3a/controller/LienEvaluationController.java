package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.service.LienEvaluationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/liens-evaluation")
public class LienEvaluationController {
    private final LienEvaluationService lienEvaluationService;

    public LienEvaluationController(LienEvaluationService lienEvaluationService) {
        this.lienEvaluationService = lienEvaluationService;
    }

    // Create
    @PostMapping
    public ResponseEntity<LienEvaluation> createLienEvaluation(
            @RequestBody LienEvaluation lienEvaluation) {

        // The date string will now be automatically converted to LocalDateTime
        // because it's in ISO format without timezone
        LienEvaluation saved = lienEvaluationService.save(lienEvaluation);
        return ResponseEntity.ok(saved);
    }

    // Read All
    @GetMapping
    public List<LienEvaluation> getAllLiensEvaluation() {
        return lienEvaluationService.getAllLiensEvaluation();
    }

    // Read by ID
    @GetMapping("/{id}")
    public ResponseEntity<LienEvaluation> getLienEvaluationById(@PathVariable Integer id) {
        return lienEvaluationService.getLienEvaluationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Read by Token
    @GetMapping("/token/{token}")
    public ResponseEntity<LienEvaluation> getLienEvaluationByToken(@PathVariable String token) {
        return lienEvaluationService.getLienEvaluationByToken(token)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Read by Formulaire
    @GetMapping("/formulaire/{formulaireId}")
    public List<LienEvaluation> getLiensByFormulaire(@PathVariable Integer formulaireId) {
        return lienEvaluationService.getLiensByFormulaire(formulaireId);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<LienEvaluation> updateLienEvaluation(
            @PathVariable Integer id,
            @RequestBody LienEvaluation updatedLien) {
        try {
            return ResponseEntity.ok(lienEvaluationService.updateLienEvaluation(id, updatedLien));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLienEvaluation(@PathVariable Integer id) {
        lienEvaluationService.deleteLienEvaluation(id);
        return ResponseEntity.noContent().build();
    }

    // Check token validity
    @GetMapping("/validate/{token}")
    public ResponseEntity<Boolean> validateToken(@PathVariable String token) {
        return ResponseEntity.ok(lienEvaluationService.isTokenValid(token));
    }
    // Generate a clickable evaluation link (add this to your controller)
    @GetMapping("/generate-link/{token}")
    public ResponseEntity<String> generateShareableLink(@PathVariable String token) {
        String frontendUrl = "http://localhost:3000/evaluation/" + token; // Your React app URL
        return ResponseEntity.ok(frontendUrl);
    }
}