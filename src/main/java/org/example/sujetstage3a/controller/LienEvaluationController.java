package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.service.LienEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/lien-evaluation")
@CrossOrigin(origins = "http://localhost:3000")
public class LienEvaluationController {

    @Autowired
    private LienEvaluationService lienEvaluationService;

    @PostMapping
    public Map<String, Object> generateLink(@RequestBody Map<String, Object> payload) {
        Integer formulaireId = (Integer) payload.get("id_formulaire");
        String exp = (String) payload.get("expiration");
        LocalDateTime expiration = (exp != null) ? LocalDateTime.parse(exp) : null;

        LienEvaluation lien = lienEvaluationService.generateLink(formulaireId, expiration);

        Map<String, Object> response = new HashMap<>();
        response.put("token", lien.getToken());
        response.put("expiration", lien.getExpiration());
        return response;
    }

    @GetMapping("/{token}")
    public LienEvaluation getLink(@PathVariable String token) {
        return lienEvaluationService.getLinkByToken(token)
                .orElseThrow(() -> new RuntimeException("Lien introuvable ou expiré"));
    }

}
