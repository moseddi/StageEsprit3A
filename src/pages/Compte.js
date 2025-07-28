import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import espritLogo from "../assets/logo1.png";
import "./Compte.css";

function Compte() {
  const [user, setUser] = useState({
    nom: "",
    adresse: "",
    identite: "",
    email: "",
  });
  const [userPhoto, setUserPhoto] = useState(localStorage.getItem("userPhoto") || "");
  const [userName, setUserName] = useState(localStorage.getItem("userNom") || "Utilisateur");
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      setMessage("Utilisateur non connecté.");
      return;
    }

    axios
      .get(`http://localhost:8081/api/users/by-email?email=${email}`)
      .then((res) => {
        setUser(res.data);
        if (res.data.photo) {
          setPreview(res.data.photo);
          setUserPhoto(res.data.photo);
        }
        setUserName(res.data.nom || "Utilisateur");
      })
      .catch(() => setMessage("Erreur lors du chargement des données."));
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files[0];
      setPhotoFile(file);
      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("nom", user.nom);
    formData.append("adresse", user.adresse || "");
    formData.append("identite", user.identite || "");
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await axios.post(
        "http://localhost:8081/api/users/update-profile",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setMessage("Profil mis à jour avec succès !");
      setUser(res.data);

      if (res.data.photo) {
        localStorage.setItem("userPhoto", res.data.photo);
        setPreview(res.data.photo);
        setUserPhoto(res.data.photo);
      }
      localStorage.setItem("userNom", res.data.nom);
      setUserName(res.data.nom);
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      setMessage(
        err.response?.data || "Erreur lors de la mise à jour du profil."
      );
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="compte-page">
      {/* NAVBAR (identique à Accueil.js) */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top custom-navbar px-4">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link className="navbar-brand d-flex align-items-center" to="/accueil">
            <img src={espritLogo} alt="Logo" className="me-2" style={{ height: "80px" }} />
          </Link>

          <div className="d-flex align-items-center gap-4">
            <ul className="navbar-nav nav-links d-flex align-items-center gap-3">
              <li className="nav-item"><Link className="nav-link" to="/accueil">Accueil</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/apropos">À propos de nous</Link></li>
              <li className="nav-item"><Link className="nav-link active" to="/compte">Compte</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/dashboard">Dashboard</Link></li>
            </ul>

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
              <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* FORMULAIRE AVEC STYLE ET ANIMATIONS */}
      <div className="container compte-container">
        <h2 className="text-center animated-title">Mon Compte</h2>

        {message && <div className="alert alert-info text-center">{message}</div>}

        <form onSubmit={handleSubmit} className="p-4 rounded shadow compte-form">
          <div className="mb-3">
            <label className="form-label">Nom</label>
            <input type="text" name="nom" value={user.nom} onChange={handleChange} className="form-control" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Adresse</label>
            <input type="text" name="adresse" value={user.adresse || ""} onChange={handleChange} className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label">Identité</label>
            <input type="text" name="identite" value={user.identite || ""} onChange={handleChange} className="form-control" />
          </div>

          <div className="mb-3">
            <label className="form-label">Email (non modifiable)</label>
            <input type="email" name="email" value={user.email} readOnly className="form-control-plaintext bg-light px-2" />
          </div>

          <div className="mb-3">
            <label className="form-label">Photo de profil</label>
            <input type="file" name="photo" accept="image/*" onChange={handleChange} className="form-control" />
          </div>

          {preview && (
            <div className="text-center mb-3">
              <img
                src={preview}
                alt="Aperçu"
                className="rounded-circle shadow-sm preview-photo"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">
            Mettre à jour
          </button>
        </form>
      </div>
    </div>
  );
}

export default Compte;
