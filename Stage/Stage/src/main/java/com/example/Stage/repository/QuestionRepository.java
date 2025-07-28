package com.example.Stage.repository;



import com.example.Stage.model.Form;
import com.example.Stage.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByForm(Form form);
    List<Question> findByFormIdOrderByOrderIndex(Long formId);

    List<Question> findByFormId(Long formId);
}