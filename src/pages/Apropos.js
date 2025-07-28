import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import espritLogo from "../assets/logo1.png";
import espritImage from "../assets/esprit.png";
import im1 from "../assets/im1.jpg";
import im2 from "../assets/im2.webp";
import im3 from "../assets/im3.jpg";
import im4 from "../assets/im4.png";
import im5 from "../assets/im5.avif";
import im6 from "../assets/im6.webp";
import "./Apropos.css";

export default function Apropos() {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setUserName(localStorage.getItem("userNom") || "Utilisateur");
    setUserPhoto(localStorage.getItem("userPhoto") || "");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="apropos-page">
      {/* NAVBAR (identique à Accueil.js) */}
<nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top custom-navbar px-4">
  <div className="container-fluid d-flex justify-content-between align-items-center">
    {/* Logo */}
    <Link className="navbar-brand d-flex align-items-center" to="/accueil">
      <img src={espritLogo} alt="Logo" className="me-2" style={{ height: "80px" }} />
    </Link>

    {/* Liens + Profil */}
    <div className="d-flex align-items-center gap-4">
      <ul className="navbar-nav nav-links d-flex align-items-center gap-3">
        <li className="nav-item"><Link className="nav-link" to="/accueil">Accueil</Link></li>
        <li className="nav-item"><Link className="nav-link active" to="/apropos">À propos de nous</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/compte">Compte</Link></li>
        <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
      </ul>

      {/* Profil utilisateur */}
      <div className="d-flex align-items-center">
        {userPhoto && (
          <img
            src={userPhoto}
            alt="Profil"
            className="rounded-circle me-2"
            style={{ width: 40, height: 40, objectFit: "cover", border: "2px solid #a762bd" }}
          />
        )}
        <span style={{ fontWeight: "bold", color: "#7a3e95", marginRight: "10px" }}>{userName}</span>

        {/* Bouton Déconnexion */}
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm"
        >
          Déconnexion
        </button>
      </div>
    </div>
  </div>
</nav>


      {/* Contenu principal */}
      <div className="apropos-content">
        {/* Logo animé */}
        <img src={espritImage} alt="Esprit" className="apropos-logo-animated" />

        <h1 className="apropos-title">À propos de EspritEval</h1>

        {/* Texte avec flèches animées */}
        <div className="animated-text">
          <p>EspritEval répond à un double objectif :</p>
          <div className="arrow-text">
            <span className="arrow">➤</span> Améliorer l’efficacité de la gestion des évaluations
          </div>
          <div className="arrow-text">
            <span className="arrow">➤</span> Offrir aux administrateurs, évaluateurs et étudiants une expérience fluide et sécurisée
          </div>
        </div>

        {/* Grille d'images en 2 rangées de 3 */}
        <div className="image-grid">
          {[im1, im5, im3, im4, im2, im6].map((image, index) => (
            <div key={index} className="image-card">
              <img src={image} alt={`Illustration ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
