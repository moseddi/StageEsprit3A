package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/*@Service
public class EvaluationLinkService {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationLinkService.class);

    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;

    @Autowired
    private FormulaireRepository formulaireRepository;

    public LienEvaluation generateEvaluationLink(Long formId, String authToken, String expiration) {
        logger.info("Generating evaluation link for formId: {}, authToken: {}", formId, authToken);
        Formulaire formulaire = formulaireRepository.findById(formId.intValue())
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));

        LienEvaluation lien = new LienEvaluation();
        lien.setIdFormulaire(formId.intValue());
        lien.setToken(UUID.randomUUID().toString());
        try {
            if (expiration != null && !expiration.isEmpty()) {
                DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
                LocalDateTime expirationDateTime = LocalDateTime.parse(expiration, formatter);
                lien.setExpiration(Timestamp.valueOf(expirationDateTime));
            } else {
                lien.setExpiration(Timestamp.valueOf(LocalDateTime.now().plusDays(7)));
            }
        } catch (Exception e) {
            logger.error("Invalid expiration date format: {}", expiration, e);
            throw new RuntimeException("Invalid expiration date format. Expected ISO_LOCAL_DATE_TIME, got: " + expiration, e);
        }

        return lienEvaluationRepository.save(lien);
    }

    public Optional<LienEvaluation> getLinkByToken(String token) {
        return lienEvaluationRepository.findByToken(token);
    }

    public String getFormTitle(Long formId) {
        return formulaireRepository.findById(formId.intValue())
                .map(Formulaire::getTitre)
                .orElse("Formulaire sans titre");
    }

    public Formulaire getFormulaireById(Integer formId) {
        return formulaireRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));
    }
}*/
@Service
public class EvaluationLinkService {
    private static final Logger logger = LoggerFactory.getLogger(EvaluationLinkService.class);

    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;

    @Autowired
    private FormulaireRepository formulaireRepository;

    public LienEvaluation generateEvaluationLink(Integer formId, Integer EVALUATEURId) {
        logger.info("Generating evaluation link for formId: {}, EVALUATEURId: {}", formId, EVALUATEURId);
        Formulaire formulaire = formulaireRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));

        LienEvaluation lien = new LienEvaluation();
        lien.setIdFormulaire(formId);
        lien.setIdEvaluateur(EVALUATEURId);
        lien.setToken(UUID.randomUUID().toString());
        lien.setExpiration(Timestamp.valueOf(LocalDateTime.now().plusDays(7)));

        return lienEvaluationRepository.save(lien);
    }

    public Optional<LienEvaluation> getLinkByEVALUATEURId(Integer EVALUATEURId) {
        List<LienEvaluation> liens = lienEvaluationRepository.findAllByIdEvaluateur(EVALUATEURId);

        if (liens.isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(
                liens.stream()
                        .sorted(Comparator.comparing(LienEvaluation::getExpiration, Comparator.nullsLast(Comparator.reverseOrder())))
                        .findFirst()
                        .get()
        );
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


    public String getFormTitle(Integer formId) {
        return formulaireRepository.findById(formId)
                .map(Formulaire::getTitre)
                .orElse("Formulaire sans titre");
    }

    public Formulaire getFormulaireById(Integer formId) {
        return formulaireRepository.findById(formId)
                .orElseThrow(() -> new RuntimeException("Formulaire non trouvé"));
    }
}