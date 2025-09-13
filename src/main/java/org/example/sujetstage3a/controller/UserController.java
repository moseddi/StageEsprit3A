 package org.example.sujetstage3a.controller;

import org.example.sujetstage3a.model.User;
import org.example.sujetstage3a.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        System.out.println("DEBUG: Validation errors: " + errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Validation failed", "errors", errors.toString()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("motDePasse");
        System.out.println("DEBUG: login - Email: " + email);
        if (password == null || password.trim().isEmpty()) {
            System.out.println("Mot de passe vide ou null pour: " + email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Le mot de passe ne peut pas être null ou vide pour l'authentification."));
        }
        User user = userService.authenticate(email, password);
        if (user != null) {
            System.out.println("Connexion réussie pour: " + email);
            return ResponseEntity.ok(user);
        }
        System.out.println("Échec de la connexion pour: " + email);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            Map<String, String> response = userService.forgotPassword(request.get("email"));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
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
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/exists-by-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
        System.out.println("Tentative de création de l'utilisateur: " + user.getEmail());
        if (userService.emailExists(user.getEmail())) {
            System.out.println("Échec de la création : l'email existe déjà.");
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
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody @Valid User userDetails) {
        String email = null;
        try {
            System.out.println("DEBUG: updateCurrentUser - Authorization Header: " + authHeader);
            if (!authHeader.startsWith("Basic ")) {
                throw new IllegalArgumentException("En-tête Authorization invalide : préfixe Basic manquant");
            }
            String base64Credentials = authHeader.substring("Basic ".length()).trim();
            String credentials = new String(Base64.getDecoder().decode(base64Credentials));
            if (!credentials.contains(":")) {
                throw new IllegalArgumentException("Format des informations d'identification invalide : caractère ':' manquant");
            }
            email = credentials.split(":")[0];
            System.out.println("DEBUG: updateCurrentUser - Extracted Email: " + email);
            User updatedUser = userService.updateCurrentUser(email, userDetails);
            System.out.println("Utilisateur mis à jour: " + updatedUser.getEmail());
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException | IllegalStateException e) {
            System.out.println("Échec de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Erreur dans l'en-tête Authorization : " + e.getMessage()));
        } catch (RuntimeException e) {
            System.out.println("Échec de la mise à jour: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur non trouvé pour l'email: " + (email != null ? email : "invalide")));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            System.out.println("Suppression de l'utilisateur: " + id);
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
