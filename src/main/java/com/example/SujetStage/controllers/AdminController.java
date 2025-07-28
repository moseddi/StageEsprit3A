package com.example.SujetStage.controllers;

import com.example.SujetStage.entities.User;
import com.example.SujetStage.entities.Etudiant;
import com.example.SujetStage.entities.Classe;
import com.example.SujetStage.repositories.UserRepository;
import com.example.SujetStage.repositories.EtudiantRepository;
import com.example.SujetStage.repositories.ClasseRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000") // React tourne sur 3000
public class AdminController {

    private final UserRepository userRepository;
    private final EtudiantRepository etudiantRepository;
    private final ClasseRepository classeRepository;

    public AdminController(UserRepository userRepository,
                           EtudiantRepository etudiantRepository,
                           ClasseRepository classeRepository) {
        this.userRepository = userRepository;
        this.etudiantRepository = etudiantRepository;
        this.classeRepository = classeRepository;
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/etudiants")
    public List<Etudiant> getEtudiants() {
        return etudiantRepository.findAll();
    }

    @GetMapping("/classes")
    public List<Classe> getClasses() {
        return classeRepository.findAll();
    }
}
