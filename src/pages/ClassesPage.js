import React, { useEffect, useState } from "react";

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/api/admin/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error("Erreur chargement classes", err));
  }, []);

  return (
    <div className="container mt-4">
      <h3>Liste des Classes</h3>
      <ul className="list-group mt-3">
        {classes.map((c, i) => (
          <li className="list-group-item" key={i}>{c.nom}</li>
        ))}
      </ul>
    </div>
  );
}
