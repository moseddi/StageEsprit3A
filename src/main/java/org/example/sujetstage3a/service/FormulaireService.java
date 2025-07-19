package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FormulaireService {
    private final FormulaireRepository formulaireRepository;

    public FormulaireService(FormulaireRepository formulaireRepository) {
        this.formulaireRepository = formulaireRepository;
    }

    public List<Formulaire> getAllFormulaires() {
        return formulaireRepository.findAll();
    }

    public Formulaire createFormulaire(Formulaire formulaire) {
        return formulaireRepository.save(formulaire);
    }
}