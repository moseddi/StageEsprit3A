package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LienEvaluationService {
    private final LienEvaluationRepository lienEvaluationRepository;

    public LienEvaluationService(LienEvaluationRepository lienEvaluationRepository) {
        this.lienEvaluationRepository = lienEvaluationRepository;
    }

    // Create
    public LienEvaluation createLienEvaluation(LienEvaluation lienEvaluation) {
        return lienEvaluationRepository.save(lienEvaluation);
    }

    // Read
    public List<LienEvaluation> getAllLiensEvaluation() {
        return lienEvaluationRepository.findAll();
    }

    public Optional<LienEvaluation> getLienEvaluationById(Integer id) {
        return lienEvaluationRepository.findById(id);
    }

    public Optional<LienEvaluation> getLienEvaluationByToken(String token) {
        return lienEvaluationRepository.findByToken(token);
    }

    public List<LienEvaluation> getLiensByFormulaire(Integer formulaireId) {
        return lienEvaluationRepository.findByFormulaireId(formulaireId);
    }

    // Update
    @Transactional
    public LienEvaluation updateLienEvaluation(Integer id, LienEvaluation updatedLien) {
        return lienEvaluationRepository.findById(id)
                .map(existingLien -> {
                    existingLien.setToken(updatedLien.getToken());
                    existingLien.setExpiration(updatedLien.getExpiration());
                    existingLien.setFormulaire(updatedLien.getFormulaire());
                    return lienEvaluationRepository.save(existingLien);
                })
                .orElseThrow(() -> new RuntimeException("LienEvaluation not found with id: " + id));
    }

    // Delete
    public void deleteLienEvaluation(Integer id) {
        lienEvaluationRepository.deleteById(id);
    }

    // Utility method
    public boolean isTokenValid(String token) {
        return lienEvaluationRepository.findByToken(token)
                .map(lien -> lien.getExpiration() == null || lien.getExpiration().isAfter(LocalDateTime.now()))
                .orElse(false);
    }
    // Save a new LienEvaluation
    public LienEvaluation save(LienEvaluation lienEvaluation) {
        return lienEvaluationRepository.save(lienEvaluation); // Uses JpaRepository's save()
    }



}