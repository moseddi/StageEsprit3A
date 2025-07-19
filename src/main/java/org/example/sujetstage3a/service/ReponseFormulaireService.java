package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.ReponseFormulaire;
import org.example.sujetstage3a.repository.ReponseFormulaireRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReponseFormulaireService {
    private final ReponseFormulaireRepository reponseFormulaireRepository;

    public ReponseFormulaireService(ReponseFormulaireRepository reponseFormulaireRepository) {
        this.reponseFormulaireRepository = reponseFormulaireRepository;
    }

    public List<ReponseFormulaire> getAllReponsesFormulaire() {
        return reponseFormulaireRepository.findAll();
    }

    public ReponseFormulaire createReponseFormulaire(ReponseFormulaire reponseFormulaire) {
        return reponseFormulaireRepository.save(reponseFormulaire);
    }
}