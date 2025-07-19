package org.example.sujetstage3a.controller;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/lien-evaluation")
public class LienEvaluationController {
    @Autowired
    private EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<LienEvaluation> generateEvaluationLink(
            @RequestParam Long id_formulaire,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime expiration) {
        LienEvaluation lien = evaluationService.generateEvaluationLink(id_formulaire, expiration);
        return ResponseEntity.ok(lien);
    }
}