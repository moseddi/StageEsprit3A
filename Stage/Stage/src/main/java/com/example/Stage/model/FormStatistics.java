package com.example.Stage.model;

import jakarta.persistence.*;

@Entity
@Table(name = "\"FormStatistics\"")
public class FormStatistics {
    @Id
    @Column(name = "form_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "form_id")
    private Form form;

    @Column(name = "average_score")
    private Double averageScore;

    @Column(name = "completion_count")
    private Integer completionCount;

    // Constructors, getters, setters
    public FormStatistics() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public Double getAverageScore() { return averageScore; }
    public void setAverageScore(Double averageScore) { this.averageScore = averageScore; }
    public Integer getCompletionCount() { return completionCount; }
    public void setCompletionCount(Integer completionCount) { this.completionCount = completionCount; }
}