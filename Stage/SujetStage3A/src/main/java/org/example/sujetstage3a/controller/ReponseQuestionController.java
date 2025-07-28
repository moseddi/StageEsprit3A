package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.ReponseQuestion;
import org.example.sujetstage3a.service.ReponseQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/reponses-question")
public class ReponseQuestionController {
    private final ReponseQuestionService service;

    @Autowired
    public ReponseQuestionController(ReponseQuestionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> createResponse(@RequestBody Map<String, Object> requestData) {
        try {
            ReponseQuestion response = service.createResponse(requestData);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    )
            );
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.getByIdWithQuestion(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public List<ReponseQuestion> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody ReponseQuestion updatedResponse
    ) {
        try {
            return ResponseEntity.ok(service.update(id, updatedResponse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "error", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    )
            );
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        try {
            service.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/by-form/{formId}")
    public ResponseEntity<List<Map<String, Object>>> getResponsesByFormId(@PathVariable Integer formId) {
        List<Map<String, Object>> responses = service.getResponsesByFormId(formId);
        return ResponseEntity.ok(responses);
    }
}