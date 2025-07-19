package com.example.SujetStage.controllers;

import com.example.SujetStage.entities.User;
import com.example.SujetStage.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.SujetStage.entities.User;

import java.io.IOException;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Autowired
    public UserController(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    // Enregistrement d’un nouvel utilisateur
    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody UserDto userDto) {
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Email déjà utilisé.");
        }

        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setNom(userDto.getNom());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setRole(userDto.getRole());

        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur enregistré avec succès.");
    }

    // Connexion utilisateur
    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                return ResponseEntity.ok("✅ Connexion réussie");
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Email ou mot de passe incorrect");
    }

    // Réinitialisation du mot de passe
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok("Mot de passe réinitialisé avec succès.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur non trouvé.");
    }

    // Mise à jour du profil utilisateur avec upload photo
    @PostMapping("/update-profile")
    public ResponseEntity<String> updateProfile(
            @RequestParam("email") String email,
            @RequestParam("nom") String nom,
            @RequestParam("adresse") String adresse,
            @RequestParam("identite") String identite,
            @RequestParam(value = "photo", required = false) MultipartFile photo
    ) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setNom(nom);
            user.setAdresse(adresse);
            user.setIdentite(identite);

            if (photo != null && !photo.isEmpty()) {
                try {
                    user.setPhoto(photo.getBytes());
                } catch (IOException e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Erreur lors du traitement de la photo.");
                }
            }

            userRepository.save(user);
            return ResponseEntity.ok("✅ Profil mis à jour avec succès.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur introuvable.");
        }
    }

    // DTO d’inscription utilisateur
    public static class UserDto {
        private String email;
        private String nom;
        private String password;
        private String role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    // Classe pour requête login (à créer dans payload ou ici)
    public static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    // Classe pour requête reset password (à créer dans payload ou ici)
    public static class ResetPasswordRequest {
        private String email;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
