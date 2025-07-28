package com.example.Stage.model;

import jakarta.persistence.*;

@Entity
@Table(name = "\"Question\"")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private String type; // scale, text, multiple_choice

    @Column(name = "order_index")
    private Integer orderIndex;

    // Constructors, getters, setters
    public Question() {}

    public Question(Form form, String text, String type, Integer orderIndex) {
        this.form = form;
        this.text = text;
        this.type = type;
        this.orderIndex = orderIndex;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Form getForm() { return form; }
    public void setForm(Form form) { this.form = form; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getOrderIndex() { return orderIndex; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
}