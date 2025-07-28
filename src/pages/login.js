import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Setup Rive animation
  const { RiveComponent, rive } = useRive({
    src: "/rive/teddy_login.riv",
    stateMachines: "Login Machine",
    autoplay: true,
  });

  // Inputs de la machine d'état
  const isCheckingInput = useStateMachineInput(rive, "Login Machine", "isChecking");
  const isHandsUpInput = useStateMachineInput(rive, "Login Machine", "isHandsUp");
  const numLookInput = useStateMachineInput(rive, "Login Machine", "numLook");

  // Nouveaux triggers pour feedback
  const failTrigger = useStateMachineInput(rive, "Login Machine", "fail");
  const shakeTrigger = useStateMachineInput(rive, "Login Machine", "shake"); 
  // ⚠️ Si dans ton Rive le trigger s'appelle "look_idle" au lieu de "shake", remplace "shake" par "look_idle" ici.

  // Animation email
  useEffect(() => {
    if (isCheckingInput) {
      isCheckingInput.value = email.length > 0;
    }
    if (numLookInput) {
      numLookInput.value = Math.min(email.length * 2, 300);
    }
  }, [email, isCheckingInput, numLookInput]);

  // Animation mot de passe (couvre yeux)
  useEffect(() => {
    if (isHandsUpInput) {
      isHandsUpInput.value = password.length > 0;
    }
  }, [password, isHandsUpInput]);

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:8081/api/users/login", {
        email,
        password,
      });

      // Stockage des infos utilisateur
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", res.data.user.email);
      localStorage.setItem("userNom", res.data.user.nom || "");
      localStorage.setItem("userRole", res.data.user.role || "USER");
      if (res.data.user.photo) {
        localStorage.setItem("userPhoto", res.data.user.photo);
      }

      navigate("/accueil");
    } catch (err) {
      setError(
        err.response?.data ||
          "Erreur lors de la connexion. Vérifiez vos identifiants."
      );

      // Déclencher la grimace ET le shake en cas d'échec
      if (failTrigger) failTrigger.fire();
      if (shakeTrigger) shakeTrigger.fire();
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #D4E2E2, #D4E2E2)",
        fontFamily: "Arial, sans-serif",
        paddingTop: 40,
      }}
    >
      {/* Teddy Bear */}
      <div style={{ width: 320, height: 320, marginBottom: 0 }}>
        <RiveComponent />
      </div>

      {/* Formulaire */}
      <div
        className="card shadow-lg p-4"
        style={{
          width: "500px",
          borderRadius: "25px",
          backgroundColor: "#fff",
          marginTop: 0,
        }}
      >
        <h2 className="text-center mb-3" style={{ color: "#7a3e95", fontWeight: "bold" }}>
          Bienvenue à <span style={{ color: "#a762bd" }}>EspritEval</span>
        </h2>
        <p className="text-center text-muted mb-4" style={{ fontSize: "14px" }}>
          Connectez-vous pour accéder à votre espace personnel
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold" style={{ color: "#7a3e95" }}>
              Email
            </label>
            <input
              type="email"
              className="form-control border-2"
              style={{ borderColor: "#c79ce1" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Entrez votre email"
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold" style={{ color: "#7a3e95" }}>
              Mot de passe
            </label>
            <input
              type="password"
              className="form-control border-2"
              style={{ borderColor: "#c79ce1" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            className="btn w-100 fw-bold"
            style={{
              backgroundColor: "#a762bd",
              border: "none",
              color: "#fff",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#7a3e95")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#a762bd")}
          >
            Se connecter
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            to="/forgot-password"
            style={{ color: "#7a3e95", textDecoration: "none" }}
          >
            Mot de passe oublié ?
          </Link>
          <p className="mt-3" style={{ fontSize: "14px" }}>
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              style={{ color: "#a762bd", textDecoration: "none" }}
            >
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
