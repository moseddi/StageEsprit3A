package com.example.SujetStage.dto;

public class SecurityCaptureRequest {
    private String email;
    private String image; // base64

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
}
