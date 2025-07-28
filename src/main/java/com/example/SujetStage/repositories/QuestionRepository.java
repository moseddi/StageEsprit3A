package com.example.SujetStage.repositories;
import com.example.SujetStage.entities.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Integer> {
}
