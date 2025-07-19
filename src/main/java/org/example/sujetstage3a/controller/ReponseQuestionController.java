package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.ReponseQuestion;
import org.example.sujetstage3a.service.ReponseQuestionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reponses-question")
public class ReponseQuestionController {
    private final ReponseQuestionService reponseQuestionService;

    public ReponseQuestionController(ReponseQuestionService reponseQuestionService) {
        this.reponseQuestionService = reponseQuestionService;
    }

    @GetMapping
    public List<ReponseQuestion> getAllReponsesQuestion() {
        return reponseQuestionService.getAllReponsesQuestion();
    }

    @PostMapping
    public ReponseQuestion createReponseQuestion(@RequestBody ReponseQuestion reponseQuestion) {
        return reponseQuestionService.createReponseQuestion(reponseQuestion);
    }
}