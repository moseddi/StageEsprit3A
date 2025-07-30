package org.example.sujetstage3a.repository;

import org.example.sujetstage3a.model.ReponseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReponseQuestionRepository extends JpaRepository<ReponseQuestion, Long> {
}