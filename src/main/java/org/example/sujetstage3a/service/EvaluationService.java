package org.example.sujetstage3a.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.model.User;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.example.sujetstage3a.repository.QuestionRepository;
import org.example.sujetstage3a.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EvaluationService {

    private static final Logger log = LoggerFactory.getLogger(EvaluationService.class); // Add logger

    @Autowired
    private FormulaireRepository formulaireRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private LienEvaluationRepository lienEvaluationRepository;

    @Autowired
    private UserRepository userRepository; // Corrected to UserRepository (assuming this is the intended dependency)

    @Transactional
    public Formulaire createFormulaire(Formulaire formulaire, Integer createurId) {
        try {
            User createur = userRepository.findById(createurId) // Fixed to use injected repository
                    .orElseThrow(() -> new RuntimeException("Createur not found"));
            formulaire.setCreateur(createur);
            return formulaireRepository.save(formulaire);
        } catch (Exception e) {
            log.error("Error creating formulaire", e); // Use the logger
            throw e;
        }
    }

    @Transactional
    public Formulaire updateFormulaire(Long id, Formulaire formulaire) {
        Formulaire existing = formulaireRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formulaire not found"));
        existing.setTitre(formulaire.getTitre());
        existing.setNiveau(formulaire.getNiveau());
        existing.setDescription(formulaire.getDescription());
        existing.setStatut(formulaire.isStatut());
        // Do not update createurId or createur here as they are immutable
        return formulaireRepository.save(existing);
    }

    @Transactional
    public void deleteFormulaire(Long id) {
        formulaireRepository.deleteById(id);
    }

    @Transactional
    public Page<Formulaire> getFormulaires(int page, int size) {
        return formulaireRepository.findAll(PageRequest.of(page, size));
    }

    @Transactional
    public Question createQuestion(Question question, Long formulaireId) {
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new RuntimeException("Formulaire not found"));
        question.setFormulaire(formulaire);
        return questionRepository.save(question);
    }

    @Transactional
    public Question updateQuestion(Long id, Question question) {
        Question existing = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        existing.setLibelle(question.getLibelle());
        existing.setBareme(question.getBareme());
        existing.setPonderation(question.getPonderation());
        existing.setStatut(question.isStatut());
        return questionRepository.save(existing);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public List<Question> getQuestionsByFormulaireId(Long formulaireId) {
        return questionRepository.findByFormulaireId(formulaireId);
    }

    @Transactional
    public LienEvaluation generateEvaluationLink(Long formulaireId, LocalDateTime expiration) {
        Formulaire formulaire = formulaireRepository.findById(formulaireId)
                .orElseThrow(() -> new RuntimeException("Formulaire not found"));
        LienEvaluation lien = new LienEvaluation();
        lien.setToken(UUID.randomUUID().toString());
        lien.setFormulaire(formulaire);
        lien.setExpiration(expiration);
        return lienEvaluationRepository.save(lien);
    }

    public LienEvaluation getLienByToken(String token) {
        return lienEvaluationRepository.findByToken(token);
    }
}