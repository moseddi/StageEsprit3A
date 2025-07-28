package com.example.Stage.repository;


import com.example.Stage.model.FormStatistics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface FormStatisticsRepository extends JpaRepository<FormStatistics, Long> {

    // Find statistics by form ID
    Optional<FormStatistics> findByFormId(Long formId);

    // Custom query to update statistics
    @Transactional
    @Modifying
    @Query("UPDATE FormStatistics fs SET " +
            "fs.averageScore = :averageScore, " +
            "fs.completionCount = :completionCount " +
            "WHERE fs.form.id = :formId")
    void updateStatistics(Long formId, Double averageScore, Integer completionCount);

    // Check if statistics exist for a form
    boolean existsByFormId(Long formId);
}