package org.example.sujetstage3a.controller;


import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.service.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {
    @Autowired
    private EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question, @RequestParam Long id_formulaire) {
        Question savedQuestion = evaluationService.createQuestion(question, id_formulaire);
        return ResponseEntity.ok(savedQuestion);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question) {
        Question updatedQuestion = evaluationService.updateQuestion(id, question);
        return ResponseEntity.ok(updatedQuestion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        evaluationService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<Question>> getQuestionsByFormulaireId(@RequestParam Long id_formulaire) {
        List<Question> questions = evaluationService.getQuestionsByFormulaireId(id_formulaire);
        return ResponseEntity.ok(questions);
    }
}