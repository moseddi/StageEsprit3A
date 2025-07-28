package com.example.Stage.repository;



import com.example.Stage.model.Form;
import com.example.Stage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FormRepository extends JpaRepository<Form, Long> {
    List<Form> findByCreatedBy(User creator);
    boolean existsByTitleAndAcademicLevel(String title, String academicLevel);
}