package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {
    private final QuestionRepository questionRepository;

    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public List<Question> getQuestionsByFormulaireId(Integer formulaireId) {
        return questionRepository.findByFormulaireId(formulaireId);
    }

    public Question getQuestionById(Integer id) {
        Optional<Question> question = questionRepository.findById(id);
        return question.orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    public Question updateQuestion(Integer id, Question questionDetails) {
        Question question = getQuestionById(id);

        question.setLibelle(questionDetails.getLibelle());
        question.setBareme(questionDetails.getBareme());
        question.setPonderation(questionDetails.getPonderation());
        question.setStatut(questionDetails.getStatut());

        return questionRepository.save(question);
    }

    public void deleteQuestion(Integer id) {
        Question question = getQuestionById(id);
        questionRepository.delete(question);
    }
}