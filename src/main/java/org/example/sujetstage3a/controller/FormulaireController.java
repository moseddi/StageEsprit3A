package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.service.FormulaireService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/formulaires")
@CrossOrigin(origins = "http://localhost:3000")
public class FormulaireController {

    private final FormulaireService formulaireService;

    @Autowired
    public FormulaireController(FormulaireService formulaireService) {
        this.formulaireService = formulaireService;
    }

    @GetMapping
    public Page<Formulaire> getAllFormulaires(Pageable pageable) {
        return formulaireService.getAllFormulairesPageable(pageable);
    }

    @GetMapping("/{id}")
    public Formulaire getFormulaireById(@PathVariable Integer id) {
        return formulaireService.getFormulaireById(id)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));
    }

    @PostMapping
    public Formulaire createFormulaire(@RequestBody Formulaire formulaire) {
        return formulaireService.createFormulaire(formulaire);
    }

    @PutMapping("/{id}")
    public Formulaire updateFormulaire(@PathVariable Integer id, @RequestBody Formulaire formulaire) {
        return formulaireService.updateFormulaire(id, formulaire);
    }

    @DeleteMapping("/{id}")
    public void deleteFormulaire(@PathVariable Integer id) {
        formulaireService.deleteFormulaire(id);
    }
}
