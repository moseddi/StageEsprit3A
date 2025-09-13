package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class LienEvaluationService {

    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;

    @Autowired
    private FormulaireRepository formulaireRepository;

    public LienEvaluation generateLink(Integer formulaireId, LocalDateTime expiration) {
        // Vérifier si le formulaire existe
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));

        // Créer le lien d'évaluation
        LienEvaluation lien = new LienEvaluation();
        lien.setIdFormulaire(formulaireId); // Utiliser l'ID du formulaire
        lien.setToken(UUID.randomUUID().toString());
        if (expiration != null) {
            lien.setExpiration(Timestamp.valueOf(expiration)); // Convertir LocalDateTime en Timestamp
        } else {
            lien.setExpiration(null); // Pas d'expiration si null
        }

        return lienEvaluationRepository.save(lien);
    }

    public Optional<LienEvaluation> getLinkByToken(String token) {
        List<LienEvaluation> liens = lienEvaluationRepository.findAllByToken(token);

        if (liens.isEmpty()) {
            return Optional.empty();
        }

        // Tri pour récupérer le lien le plus récent non expiré
        return liens.stream()
                .filter(l -> l.getExpiration() == null || l.getExpiration().after(new Date()))
                .sorted(Comparator.comparing(LienEvaluation::getExpiration, Comparator.nullsLast(Comparator.reverseOrder())))
                .findFirst();
    }


    // Méthode pour récupérer le titre du formulaire
    public String getFormTitle(Integer formId) {
        return formulaireRepository.findById(formId)
                .map(Formulaire::getTitre)
                .orElse("Formulaire sans titre");
    }

    // Méthode pour récupérer le formulaire par ID
    public Formulaire getFormulaireById(Integer formId) {
        return formulaireRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));
    }
}