import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Formulaire() {
  const [formulaires, setFormulaires] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFormulaires();
  }, []);

  const fetchFormulaires = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/formulaires");
      setFormulaires(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des formulaires :", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce formulaire ?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/formulaires/${id}`);
      fetchFormulaires();
    } catch (err) {
      console.error("Erreur suppression formulaire :", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/formulaireadmin?id=${id}`); // redirige vers page édition
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Gestion des formulaires</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => navigate("/formulaireadmin")}>
        Créer un nouveau formulaire
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formulaires.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.titre}</TableCell>
                <TableCell>{f.description}</TableCell>
                <TableCell>{f.niveau}</TableCell>
                <TableCell>{f.classe ? f.classe.nom : "N/A"}</TableCell>
                <TableCell>
                  <Tooltip title="Modifier">
                    <IconButton onClick={() => handleEdit(f.id)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton onClick={() => handleDelete(f.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
