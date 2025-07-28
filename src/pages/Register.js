import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adresse, setAdresse] = useState("");
  const [identite, setIdentite] = useState("");
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
        body: JSON.stringify({ nom, email, password, role, adresse, identite }),
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
    <div className="container mt-5">
      <div className="card shadow p-4" style={{ maxWidth: "900px", margin: "auto", borderRadius: "15px" }}>
        <h2 className="text-center mb-4" style={{ color: "#a762bd" }}>
          Créer un compte
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
        >
          {/* Ligne 1 */}
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Nom</label>
              <input
                type="text"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: utilisateur@esprit.tn"
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-bold">Rôle</label>
              <select
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="evaluateur">Évaluateur</option>
              </select>
            </div>
          </div>

          {/* Ligne 2 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Adresse</label>
              <input
                type="text"
                className="form-control"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                placeholder="Votre adresse"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Identité</label>
              <input
                type="text"
                className="form-control"
                value={identite}
                onChange={(e) => setIdentite(e.target.value)}
                placeholder="Votre identité"
              />
            </div>
          </div>

          {/* Ligne 3 */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="******"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn w-100" style={{ backgroundColor: "#a762bd", color: "white" }}>
            S'inscrire
          </button>
        </form>

        <p className="text-center mt-3" style={{ fontSize: "14px" }}>
          Déjà inscrit ? <Link to="/" style={{ color: "#a762bd" }}>Connectez-vous</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
