import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin"); // valeur par défaut
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, password, role }),
      });

      if (response.ok) {
        navigate("/");
      } else {
        const message = await response.text();
        setError(message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Créer un compte</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label>Nom</label>
        <input
          type="text"
          className="form-control"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Votre nom"
        />
      </div>

      <div className="mb-3">
        <label>Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex: utilisateur@esprit.tn"
        />
      </div>

      <div className="mb-3">
        <label>Rôle</label>
        <select
          className="form-control"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="evaluateur">Évaluateur</option>
        </select>
      </div>

      <div className="mb-3">
        <label>Mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="******"
        />
      </div>

      <div className="mb-3">
        <label>Confirmer le mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="******"
        />
      </div>

      <button className="btn btn-primary w-100" onClick={handleRegister}>
        S'inscrire
      </button>
    </div>
  );
}

export default Register;
