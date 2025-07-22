package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class LienEvaluationService {

    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;

    @Autowired
    private FormulaireRepository formulaireRepository;

    public LienEvaluation generateLink(Integer formulaireId, LocalDateTime expiration) {
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));

        LienEvaluation lien = new LienEvaluation();
        lien.setFormulaire(formulaire);
        lien.setToken(UUID.randomUUID().toString());
        lien.setExpiration(expiration);

        return lienEvaluationRepository.save(lien);
    }

    public Optional<LienEvaluation> getLinkByToken(String token) {
        return lienEvaluationRepository.findByToken(token);
    }
}
