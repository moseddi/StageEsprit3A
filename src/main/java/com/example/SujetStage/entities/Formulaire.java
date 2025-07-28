    package com.example.SujetStage.entities;
    import jakarta.persistence.*;
    import java.util.List;

    @Entity
    @Table(name = "formulaire")
    public class Formulaire {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Integer id;

        @Column(nullable = false, length = 150)
        private String titre;

        private String description;

        @Column(nullable = false)
        private Boolean statut = true;

        private String niveau;

        // Relation avec Classe
        @ManyToOne
        @JoinColumn(name = "id_classe", referencedColumnName = "id")
        private Classe classe;

        // Relation avec Questions
        @OneToMany(mappedBy = "formulaire", cascade = CascadeType.ALL)
        private List<Question> questions;

        // Getters et Setters
        public Integer getId() {
            return id;
        }

        public void setId(Integer id) {
            this.id = id;
        }

        public String getTitre() {
            return titre;
        }

        public void setTitre(String titre) {
            this.titre = titre;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Boolean getStatut() {
            return statut;
        }

        public void setStatut(Boolean statut) {
            this.statut = statut;
        }

        public String getNiveau() {
            return niveau;
        }

        public void setNiveau(String niveau) {
            this.niveau = niveau;
        }

        public Classe getClasse() {
            return classe;
        }

        public void setClasse(Classe classe) {
            this.classe = classe;
        }

        public List<Question> getQuestions() {
            return questions;
        }

        public void setQuestions(List<Question> questions) {
            this.questions = questions;
        }
    }
