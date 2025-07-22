package org.example.sujetstage3a.service;

import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private FormulaireRepository formulaireRepository;

    public List<Question> getQuestionsByFormulaireId(Integer formulaireId) {
        return questionRepository.findByFormulaireId(formulaireId);
    }

    public Question createQuestion(Question question, Integer formulaireId) {
        Optional<Formulaire> formulaire = formulaireRepository.findById(formulaireId);
        if (formulaire.isEmpty()) throw new RuntimeException("Formulaire non trouvé");

        question.setFormulaire(formulaire.get());
        return questionRepository.save(question);
    }

    public Question updateQuestion(Integer id, Question questionDetails) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question non trouvée"));

        q.setLibelle(questionDetails.getLibelle());
        q.setBareme(questionDetails.getBareme());
        q.setPonderation(questionDetails.getPonderation());
        q.setStatut(questionDetails.getStatut());
        return questionRepository.save(q);
    }

    public void deleteQuestion(Integer id) {
        Question q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question non trouvée"));
        questionRepository.delete(q);
    }
}
