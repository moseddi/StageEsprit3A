import React, { useState } from "react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const result = await response.text();
      setMessage(result);
    } catch (err) {
      setMessage("Erreur lors de la réinitialisation du mot de passe.");
    }
  };

  return (
    <div
      className="container mt-5"
      style={{ maxWidth: "400px", borderRadius: "15px", padding: "20px", boxShadow: "0 0 15px rgba(167, 98, 189, 0.4)" }}
    >
      <h2
        className="text-center mb-4"
        style={{ color: "#a762bd", fontWeight: "700", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      >
        Mot de passe oublié
      </h2>

      {message && (
        <div
          className="alert"
          style={{
            backgroundColor: "#f3eaff",
            color: "#7a3e95",
            border: "1px solid #a762bd",
            fontWeight: "600",
          }}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="mb-3">
        <label
          className="form-label"
          style={{ color: "#7a3e95", fontWeight: "600" }}
        >
          Email
        </label>
        <input
          type="email"
          className="form-control border border-2"
          placeholder="ex: utilisateur@esprit.tn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ borderColor: "#a762bd" }}
        />
      </div>

      <div className="mb-3">
        <label
          className="form-label"
          style={{ color: "#7a3e95", fontWeight: "600" }}
        >
          Nouveau mot de passe
        </label>
        <input
          type="password"
          className="form-control border border-2"
          placeholder="******"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ borderColor: "#a762bd" }}
        />
      </div>

      <button
        className="btn w-100"
        style={{
          backgroundColor: "#a762bd",
          color: "white",
          fontWeight: "600",
          borderRadius: "6px",
          border: "none",
        }}
        onClick={handleReset}
      >
        Réinitialiser
      </button>
    </div>
  );
}

export default ForgotPassword;
