package com.example.Stage.controller;

import com.example.Stage.model.User;
import com.example.Stage.repository.UserRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public String login(@RequestParam String email,
                        @RequestParam String password,
                        HttpSession session) {

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null && user.getPassword().equals(password)) {
            session.setAttribute("user", user);
            return user.getRole(); // Returns "ADMIN", "TEACHER" or "EVALUATOR"
        }
        return "invalid";
    }

    @PostMapping("/register")
    public String register(@RequestParam String name,
                           @RequestParam String email,
                           @RequestParam String password,
                           @RequestParam String role) { // Now accepting role parameter

        if (userRepository.existsByEmail(email)) {
            return "exists";
        }

        User newUser = new User(name, email, password, role);
        userRepository.save(newUser);
        return "success";
    }
    @GetMapping("/check")
    public String checkAuth(HttpSession session) {
        User user = (User) session.getAttribute("user");
        return user != null ? user.getRole() : "none";
    }
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "logged_out";
    }
    @GetMapping("/ping")
    public String ping() {
        return "Backend is working!";
    }
}