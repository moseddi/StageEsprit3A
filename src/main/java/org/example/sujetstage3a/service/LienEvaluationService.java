package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.LienEvaluation;
import org.example.sujetstage3a.repository.LienEvaluationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LienEvaluationService {
    private final LienEvaluationRepository lienEvaluationRepository;

    public LienEvaluationService(LienEvaluationRepository lienEvaluationRepository) {
        this.lienEvaluationRepository = lienEvaluationRepository;
    }

    public List<LienEvaluation> getAllLiensEvaluation() {
        return lienEvaluationRepository.findAll();
    }

    public LienEvaluation createLienEvaluation(LienEvaluation lienEvaluation) {
        return lienEvaluationRepository.save(lienEvaluation);
    }
}