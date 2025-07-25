package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.User;
import org.example.sujetstage3a.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid; // Utilisez jakarta.validation si vous êtes en Spring Boot 3+
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional; // Ajouté pour le nouveau endpoint et les vérifications

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        // CORRECTION MAJEURE ICI : Le frontend envoie 'motDePasse', pas 'password'
        String password = credentials.get("motDePasse");
        System.out.println("Tentative de connexion avec email: " + email);

        // Ajout d'une vérification immédiate si le mot de passe est null ou vide côté backend
        if (password == null || password.trim().isEmpty()) {
            System.out.println("Mot de passe vide ou null pour: " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le mot de passe ne peut pas être null ou vide pour l'authentification.");
        }

        User user = userService.authenticate(email, password);
        if (user != null) {
            System.out.println("Connexion réussie pour: " + email);
            return ResponseEntity.ok(user);
        }
        System.out.println("Échec de la connexion pour: " + email);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            Map<String, String> response = userService.forgotPassword(request.get("email"));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        System.out.println("Utilisateurs renvoyés: " + users);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // NOUVEAU ENDPOINT : Permet au frontend de vérifier si un email existe déjà
    @GetMapping("/exists-by-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        // Cette méthode doit être implémentée dans votre UserService
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
        System.out.println("Tentative de création de l'utilisateur: " + user.getEmail());
        // Ajout d'une vérification côté contrôleur pour l'email avant de tenter la création
        if (userService.emailExists(user.getEmail())) {
            System.out.println("Échec de la création : l'email existe déjà.");
            // Renvoie un statut CONFLICT (409) si l'email existe déjà
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        User createdUser = userService.createUser(user);
        System.out.println("Utilisateur créé avec succès: " + createdUser.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Integer id,
                                           @RequestBody @Valid User userDetails) {
        try {
            System.out.println("Mise à jour de l'utilisateur " + id + " avec: " + userDetails.getEmail());
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            System.out.println("Échec de la mise à jour: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateCurrentUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid User userDetails) {

        try {
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            String credentials = new String(Base64.getDecoder().decode(base64Credentials));
            String email = credentials.split(":")[0];

            System.out.println("Mise à jour de l'utilisateur actuel pour email: " + email);
            User updatedUser = userService.updateCurrentUser(email, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            System.out.println("Échec de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            System.out.println("Suppression de l'utilisateur: " + id);
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}