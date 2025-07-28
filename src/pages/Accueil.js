import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import espritLogo from "../assets/logo1.png";
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";
import img6 from "../assets/img6.jpg";
import "./Accueil.css";

export default function Accueil() {
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const images = [img4, img5, img6];

  useEffect(() => {
    setUserName(localStorage.getItem("userNom") || "Utilisateur");
    setUserPhoto(localStorage.getItem("userPhoto") || "");

    // Faire défiler les images toutes les 4 secondes
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="accueil-page">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top custom-navbar px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" to="/accueil">
            <img src={espritLogo} alt="Logo" className="me-2" style={{ height: "80px" }} />
          </Link>

          {/* Liens + Profil */}
          <div className="d-flex align-items-center gap-4">
            <ul className="navbar-nav nav-links d-flex align-items-center gap-3">
              <li className="nav-item"><Link className="nav-link active" to="/accueil">Accueil</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/apropos">À propos de nous</Link></li>
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

      {/* CAROUSEL SLIDE */}
      <div className="carousel-container">
        <img src={images[currentSlide]} alt="Slide" className="carousel-img" />
      </div>

      {/* TEXTE AU CENTRE */}
      <div className="carousel-caption-container">
        <h1 className="main-title animated-title">
          Bienvenue sur <span className="highlight">EspritEval</span>
        </h1>
        <p className="subtitle animated-subtitle">
          Une plateforme moderne pour créer et analyser vos évaluations efficacement.
        </p>
        <Link to="/apropos" className="btn btn-primary btn-lg mt-3 shadow">
  Découvrir maintenant
</Link>

      </div>
    </div>
  );
}
