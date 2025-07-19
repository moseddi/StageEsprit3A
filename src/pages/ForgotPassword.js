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
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Mot de passe oublié</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="ex: utilisateur@esprit.tn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Nouveau mot de passe</label>
        <input
          type="password"
          className="form-control"
          placeholder="******"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <button className="btn btn-primary w-100" onClick={handleReset}>
        Réinitialiser
      </button>
    </div>
  );
}

export default ForgotPassword;
