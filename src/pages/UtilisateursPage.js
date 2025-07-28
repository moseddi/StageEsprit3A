import React, { useEffect, useState } from "react";

export default function UtilisateursPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/admin/utilisateurs")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Erreur chargement utilisateurs", err));
  }, []);

  return (
    <div className="container mt-4">
      <h3>Liste des Utilisateurs</h3>
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={i}>
              <td>{u.nom}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
