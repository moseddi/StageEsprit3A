import React, { useEffect, useState } from "react";
import axios from "axios";

function Compte() {
  const [user, setUser] = useState({
    nom: "",
    adresse: "",
    identite: "",
    email: "",
    photo: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Remplace 1 par l'ID de l'utilisateur connecté (ou via token/jwt)
    axios.get("http://localhost:8080/api/users/1")
      .then((res) => {
        setUser(res.data);
        if (res.data.photo) {
          setPreview(`data:image/jpeg;base64,${res.data.photo}`);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setUser((prev) => ({ ...prev, photo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const key in user) {
      formData.append(key, user[key]);
    }

    axios.put("http://localhost:8080/api/users/1", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => alert("Profil mis à jour"))
      .catch((err) => console.error("Erreur update:", err));
  };

  return (
    <div className="container mt-5">
      <h2>Mon Compte</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom:</label>
          <input type="text" name="nom" value={user.nom} onChange={handleChange} />
        </div>
        <div>
          <label>Adresse:</label>
          <input type="text" name="adresse" value={user.adresse} onChange={handleChange} />
        </div>
        <div>
          <label>Identité:</label>
          <input type="text" name="identite" value={user.identite} onChange={handleChange} />
        </div>
        <div>
          <label>Email (non modifiable):</label>
          <input type="email" name="email" value={user.email} readOnly />
        </div>
        <div>
          <label>Photo de profil:</label>
          <input type="file" onChange={handlePhotoChange} accept="image/*" />
          {preview && <img src={preview} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}
        </div>
        <button type="submit">Mettre à jour</button>
      </form>
    </div>
  );
}

export default Compte;
