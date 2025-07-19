package org.example.sujetstage3a.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "formulaires")
public class Formulaire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String niveau;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean statut;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_createur", nullable = false)
    private User createur;

    @Column(name = "id_createur", insertable = false, updatable = false)
    private Integer createurId; // Changed to Integer to match User.id

    @OneToMany(mappedBy = "formulaire", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;

    @OneToMany(mappedBy = "formulaire", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LienEvaluation> liens;

    @Column(updatable = false)
    private LocalDateTime dateCreation;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }
    public String getNiveau() { return niveau; }
    public void setNiveau(String niveau) { this.niveau = niveau; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isStatut() { return statut; }
    public void setStatut(boolean statut) { this.statut = statut; }
    public User getCreateur() { return createur; }
    public void setCreateur(User createur) { this.createur = createur; }
    public Integer getCreateurId() { return createurId; }
    public void setCreateurId(Integer createurId) { this.createurId = createurId; }
    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }
    public List<LienEvaluation> getLiens() { return liens; }
    public void setLiens(List<LienEvaluation> liens) { this.liens = liens; }
    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }
}