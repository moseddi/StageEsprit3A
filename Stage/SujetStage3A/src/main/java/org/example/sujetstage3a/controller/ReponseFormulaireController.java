package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.ReponseFormulaire;
import org.example.sujetstage3a.service.ReponseFormulaireService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reponses-formulaire")
public class ReponseFormulaireController {
    private final ReponseFormulaireService reponseFormulaireService;

    public ReponseFormulaireController(ReponseFormulaireService reponseFormulaireService) {
        this.reponseFormulaireService = reponseFormulaireService;
    }

    @GetMapping
    public List<ReponseFormulaire> getAllReponsesFormulaire() {
        return reponseFormulaireService.getAllReponsesFormulaire();
    }

    @PostMapping
    public ReponseFormulaire createReponseFormulaire(@RequestBody ReponseFormulaire reponseFormulaire) {
        return reponseFormulaireService.createReponseFormulaire(reponseFormulaire);
    }
}