package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.ReponseQuestion;
import org.example.sujetstage3a.repository.ReponseQuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReponseQuestionService {
    private final ReponseQuestionRepository reponseQuestionRepository;

    public ReponseQuestionService(ReponseQuestionRepository reponseQuestionRepository) {
        this.reponseQuestionRepository = reponseQuestionRepository;
    }

    public List<ReponseQuestion> getAllReponsesQuestion() {
        return reponseQuestionRepository.findAll();
    }

    public ReponseQuestion createReponseQuestion(ReponseQuestion reponseQuestion) {
        return reponseQuestionRepository.save(reponseQuestion);
    }
}