import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Statut de la réponse :", response.status);
      const result = await response.text();
      console.log("Contenu de la réponse :", result);

      if (response.ok && result.startsWith("✅")) {
        localStorage.setItem("userEmail", email);
        navigate("/accueil");
      } else if (response.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Erreur de connexion :", err);
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Connexion</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex: utilisateur@esprit.tn"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Mot de passe</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="******"
          required
        />
      </div>

      <button className="btn btn-primary w-100" onClick={handleLogin}>
        Se connecter
      </button>

      <div className="mt-3 text-center">
        <a href="/forgot-password">Mot de passe oublié ?</a>
        <br />
        <a href="/register">Créer un nouveau compte</a>
      </div>
    </div>
  );
}

export default Login;
