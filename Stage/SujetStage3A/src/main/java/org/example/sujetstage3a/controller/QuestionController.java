package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.model.Formulaire;
import org.example.sujetstage3a.repository.FormulaireRepository;
import org.example.sujetstage3a.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {
    private final QuestionService questionService;
    private final FormulaireRepository formulaireRepository;

    public QuestionController(QuestionService questionService,
                              FormulaireRepository formulaireRepository) {
        this.questionService = questionService;
        this.formulaireRepository = formulaireRepository;
    }

    @GetMapping
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/formulaire/{formulaireId}")
    public ResponseEntity<List<Question>> getQuestionsByFormulaireId(@PathVariable Integer formulaireId) {
        List<Question> questions = questionService.getQuestionsByFormulaireId(formulaireId);
        return ResponseEntity.ok(questions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Integer id) {
        Question question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        // Validate required fields
        if (question.getLibelle() == null || question.getBareme() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Handle formulaire relationship
        if (question.getFormulaire() == null || question.getFormulaire().getId() == null) {
            return ResponseEntity.badRequest().body(null);
        }

        Formulaire formulaire = formulaireRepository.findById(question.getFormulaire().getId())
                .orElseThrow(() -> new RuntimeException("Formulaire not found"));

        question.setFormulaire(formulaire);
        Question savedQuestion = questionService.createQuestion(question);
        return ResponseEntity.ok(savedQuestion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(
            @PathVariable Integer id,
            @RequestBody Question question) {

        // Validate existing question
        Question existingQuestion = questionService.getQuestionById(id);
        if (existingQuestion == null) {
            return ResponseEntity.notFound().build();
        }

        // Update fields
        if (question.getLibelle() != null) {
            existingQuestion.setLibelle(question.getLibelle());
        }
        if (question.getBareme() != null) {
            existingQuestion.setBareme(question.getBareme());
        }
        if (question.getPonderation() != null) {
            existingQuestion.setPonderation(question.getPonderation());
        }
        if (question.getStatut() != null) {
            existingQuestion.setStatut(question.getStatut());
        }

        // Handle formulaire update if provided
        if (question.getFormulaire() != null && question.getFormulaire().getId() != null) {
            Formulaire formulaire = formulaireRepository.findById(question.getFormulaire().getId())
                    .orElseThrow(() -> new RuntimeException("Formulaire not found"));
            existingQuestion.setFormulaire(formulaire);
        }

        Question updatedQuestion = questionService.updateQuestion(id, existingQuestion);
        return ResponseEntity.ok(updatedQuestion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }
}
