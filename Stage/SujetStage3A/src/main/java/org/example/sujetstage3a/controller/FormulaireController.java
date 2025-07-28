package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.User;
import org.example.sujetstage3a.service.FormulaireService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formulaires")
@CrossOrigin(origins = "http://localhost:3000")
public class FormulaireController {
    private final FormulaireService formulaireService;

    public FormulaireController(FormulaireService formulaireService) {
        this.formulaireService = formulaireService;
    }

    @GetMapping
    public List<Formulaire> getAllFormulaires() {
        return formulaireService.getAllFormulaires();
    }

    @GetMapping("/my")
    public List<Formulaire> getMyFormulaires(@RequestHeader("X-User-ID") Integer userId) {
        return formulaireService.getFormulairesByCreatorId(userId);
    }

    @GetMapping("/{id}")
    public Formulaire getFormulaireById(@PathVariable Integer id) {
        return formulaireService.getFormulaireById(id);
    }

    @PostMapping
    public Formulaire createFormulaire(@RequestBody Formulaire formulaire,
                                       @RequestHeader("X-User-ID") Integer userId) {
        User creator = new User();
        creator.setId(userId);
        formulaire.setCreateur(creator);
        return formulaireService.createFormulaire(formulaire);
    }

    @PutMapping("/{id}")
    public Formulaire updateFormulaire(@PathVariable Integer id,
                                       @RequestBody Formulaire formulaire) {
        return formulaireService.updateFormulaire(id, formulaire);
    }

    @DeleteMapping("/{id}")
    public void deleteFormulaire(@PathVariable Integer id) {
        formulaireService.deleteFormulaire(id);
    }
}