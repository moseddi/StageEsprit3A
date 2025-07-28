package org.example.sujetstage3a.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.sujetstage3a.model.Question;
import org.example.sujetstage3a.model.ReponseQuestion;
import org.example.sujetstage3a.repository.QuestionRepository;
import org.example.sujetstage3a.repository.ReponseQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReponseQuestionService {
    private final ReponseQuestionRepository repository;
    private final QuestionRepository questionRepository;

    @Autowired
    public ReponseQuestionService(
            ReponseQuestionRepository repository,
            QuestionRepository questionRepository
    ) {
        this.repository = repository;
        this.questionRepository = questionRepository;
    }

    public ReponseQuestion createResponse(Map<String, Object> requestData) {
        // Validate required fields
        if (!requestData.containsKey("questionText") || !requestData.containsKey("questionId")) {
            throw new RuntimeException("Missing required fields: 'questionText' and 'questionId'");
        }

        // Create new response
        ReponseQuestion response = new ReponseQuestion();
        response.setValeur((String) requestData.get("questionText"));

        // Set question
        Integer questionId = (Integer) requestData.get("questionId");
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + questionId));
        response.setQuestion(question);

        // Log ignored fields
        if (requestData.containsKey("choices")) {
            System.out.println("Note: 'choices' field is ignored in current implementation");
        }
        if (requestData.containsKey("isCorrect")) {
            System.out.println("Note: 'isCorrect' field is ignored in current implementation");
        }

        return repository.save(response);
    }

    public ReponseQuestion getByIdWithQuestion(Integer id) {
        return repository.findByIdWithQuestion(id)
                .orElseThrow(() -> new RuntimeException("Response not found with id: " + id));
    }

    public List<ReponseQuestion> getAll() {
        return repository.findAll();
    }

    public ReponseQuestion update(Integer id, ReponseQuestion updatedResponse) {
        ReponseQuestion existing = getByIdWithQuestion(id);
        existing.setValeur(updatedResponse.getValeur());
        existing.setQuestion(updatedResponse.getQuestion());
        return repository.save(existing);
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }

    public List<Map<String, Object>> getResponsesByFormId(Integer formId) {
        // Debug logging
        System.out.println("Fetching responses for form ID: " + formId);

        // Use the new repository method that fetches questions eagerly
        List<ReponseQuestion> responses = repository.findByFormIdWithQuestions(formId);

        System.out.println("Found " + responses.size() + " responses");

        return responses.stream()
                .map(response -> {
                    // Debug each response
                    System.out.println("Processing response ID: " + response.getId() +
                            " | Answer: " + response.getValeur() +
                            " | Question ID: " + (response.getQuestion() != null ? response.getQuestion().getId() : "null"));

                    Map<String, Object> responseData = new HashMap<>();

                    // 1. Add all response fields
                    responseData.put("id", response.getId());
                    responseData.put("answer", response.getValeur()); // The actual submitted answer

                    // 2. Add question details if exists
                    if (response.getQuestion() != null) {
                        Question q = response.getQuestion();
                        responseData.put("questionId", q.getId());
                        responseData.put("questionText", q.getLibelle());
                        responseData.put("maxScore", q.getBareme());

                        // Try to parse choices if it looks like JSON
                        if (q.getLibelle() != null && q.getLibelle().startsWith("[")) {
                            try {
                                List<String> choices = new ObjectMapper().readValue(q.getLibelle(), List.class);
                                responseData.put("choices", choices);
                            } catch (Exception e) {
                                responseData.put("choices", List.of(q.getLibelle()));
                            }
                        }
                    }

                    return responseData;
                })
                .collect(Collectors.toList());
    }
}