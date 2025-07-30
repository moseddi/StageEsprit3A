package org.example.sujetstage3a.dto;

import java.time.LocalDateTime;

public class GenerateLinkRequest {
    private LocalDateTime expirationDate;

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }
}
