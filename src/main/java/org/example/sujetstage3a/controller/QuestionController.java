package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:3000")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    @GetMapping
    public List<Question> getQuestions(@RequestParam Integer id_formulaire) {
        return questionService.getQuestionsByFormulaireId(id_formulaire);
    }

    @PostMapping
    public Question createQuestion(@RequestBody Question question, @RequestParam Integer id_formulaire) {
        return questionService.createQuestion(question, id_formulaire);
    }

    @PutMapping("/{id}")
    public Question updateQuestion(@PathVariable Integer id, @RequestBody Question question) {
        return questionService.updateQuestion(id, question);
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable Integer id) {
        questionService.deleteQuestion(id);
    }
}