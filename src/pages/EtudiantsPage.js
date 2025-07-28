import React, { useEffect, useState } from "react";

export default function EtudiantsPage() {
  const [etudiants, setEtudiants] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/admin/etudiants")
      .then(res => res.json())
      .then(data => setEtudiants(data))
      .catch(err => console.error("Erreur chargement étudiants", err));
  }, []);

  return (
    <div className="container mt-4">
      <h3>Liste des Étudiants</h3>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Classe</th>
          </tr>
        </thead>
        <tbody>
          {etudiants.map((e, i) => (
            <tr key={i}>
              <td>{e.nom}</td>
              <td>{e.email}</td>
              <td>{e.classe?.nom || "Non assignée"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
