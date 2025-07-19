import React, { useState } from "react";
import espritLogo from "../assets/esprit.png";
import formulaireImg from "../assets/formulaire.png";
import evaluationImg from "../assets/evaluation.png";
import userImg from "../assets/user.png";
import { motion } from "framer-motion";
import './Sidebar.css';
import './Accueil.css';

function Accueil() {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  return (
    <div className="d-flex flex-column bg-light" style={{ minHeight: "100vh" }}>
      {/* Conteneur principal avec Sidebar + Contenu */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
          <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "»" : "«"}
          </button>

          <div className="text-center py-4">
            <motion.img
              src={espritLogo}
              alt="Esprit"
              className="logo-esprit mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            />
            {!collapsed && <h5 className="text-white">EspritEval</h5>}
          </div>

          <ul className="nav flex-column px-3">
            {[
              ["🏠 Accueil", "/accueil"],
              ["👤 Compte", "/compte"],      // ✅ Lien corrigé vers /compte
              ["📝 Formulaires", "#"],
              ["❓ Questions", "#"]
            ].map(([label, href]) => (
              <li className="nav-item" key={label}>
                <a className="nav-link text-white" href={href}>
                  {label.split(" ")[0]} {collapsed ? "" : label.split(" ")[1]}
                </a>
              </li>
            ))}

            <li className="nav-item mt-3">
              <button className="btn btn-outline-light w-100" onClick={handleLogout}>
                🚪 {collapsed ? "" : "Se déconnecter"}
              </button>
            </li>
          </ul>
        </div>

        {/* Contenu principal */}
        <motion.div
          className="flex-grow-1 p-4"
          style={{ marginLeft: collapsed ? "70px" : "220px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-5">
            <motion.h1
              className="fw-bold"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Bienvenue sur <span className="text-primary">EspritEval</span> 🎓
            </motion.h1>
            <p className="text-muted">
              Une plateforme intelligente pour créer, gérer et analyser les évaluations.
            </p>
          </div>

          <div className="mb-5 px-3">
            <h3 className="text-decoration-underline">🔍 À propos de l'application</h3>
            <p>
              EspritEval est une application web dédiée à l'évaluation personnalisée
              des étudiants. Les utilisateurs peuvent créer des formulaires dynamiques,
              ajouter des questions, attribuer des barèmes et suivre les réponses.
            </p>
          </div>

          <div className="row text-center">
            {[{
              img: formulaireImg,
              title: "Formulaires dynamiques",
              desc: "Créez et attribuez facilement des formulaires aux classes ciblées."
            }, {
              img: evaluationImg,
              title: "Évaluations efficaces",
              desc: "Centralisez les réponses et analysez les performances."
            }, {
              img: userImg,
              title: "Gestion des utilisateurs",
              desc: "Administrateurs et évaluateurs ont chacun leurs rôles dédiés."
            }].map((item, i) => (
              <motion.div
                className="col-md-4 mb-4"
                key={i}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="img-fluid rounded shadow-lg mb-3"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <h5 className="fw-bold">{item.title}</h5>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ✅ Footer */}
      <motion.footer
        className="bg-dark text-white text-center py-3 footer"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
      >
        <div>
          <p className="mb-1">
            © {new Date().getFullYear()} <strong>EspritEval</strong> – Tous droits réservés.
          </p>
          <p className="small">
            Propulsé par <span className="text-warning">ESPRIT</span> |
            <a href="mailto:contact@espriteval.tn" className="text-light ms-1">Contactez-nous</a>
          </p>
        </div>
      </motion.footer>
    </div>
  );
}

export default Accueil;
