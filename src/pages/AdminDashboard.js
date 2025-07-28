import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  CssBaseline,
  Toolbar,
  AppBar,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Tooltip,
  Button,
  Fab,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import DescriptionIcon from "@mui/icons-material/Description"; // Icône pour Formulaires
import AddIcon from "@mui/icons-material/Add"; // Bouton + (ajout)
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";

const drawerWidth = 240;
const violet = "#a762bd";
const violetLight = "#c79ce1";
const violetDark = "#7a3e95";
const tableHeight = 550;

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSection, setSelectedSection] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const [user, setUser] = useState({
    nom: localStorage.getItem("userNom") || "Utilisateur",
    photo: localStorage.getItem("userPhoto") || null,
    role: localStorage.getItem("userRole") || "",
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleGoHome = () => {
    navigate("/accueil");
  };

  const goToFormulaires = () => {
    navigate("/formulaire"); // Page liste des formulaires
  };

  const goToCreateFormulaire = () => {
    navigate("/formulaireadmin"); // Page de création des formulaires
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, etudiantsRes, classesRes] = await Promise.all([
          axios.get("http://localhost:8081/api/admin/users"),
          axios.get("http://localhost:8081/api/admin/etudiants"),
          axios.get("http://localhost:8081/api/admin/classes"),
        ]);
        setUsers(usersRes.data);
        setEtudiants(etudiantsRes.data);
        setClasses(classesRes.data);
      } catch (error) {
        console.error("Erreur chargement données", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (!email) return;
        const res = await axios.get(
          `http://localhost:8081/api/users/by-email?email=${email}`
        );
        const data = res.data;
        localStorage.setItem("userNom", data.nom);
        if (data.photo) localStorage.setItem("userPhoto", data.photo);
        if (data.role) localStorage.setItem("userRole", data.role);
        setUser({
          nom: data.nom || "Utilisateur",
          photo: data.photo || null,
          role: data.role || "",
        });
      } catch (err) {
        console.error("Erreur chargement utilisateur :", err);
      }
    };

    fetchUser();
    const updateFromStorage = () => {
      setUser({
        nom: localStorage.getItem("userNom") || "Utilisateur",
        photo: localStorage.getItem("userPhoto") || null,
        role: localStorage.getItem("userRole") || "",
      });
    };
    window.addEventListener("storage", updateFromStorage);
    return () => window.removeEventListener("storage", updateFromStorage);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const filterData = (data, keys) =>
    data.filter((item) =>
      keys.some((key) =>
        (key.includes(".")
          ? key.split(".").reduce((o, k) => (o ? o[k] : ""), item)
          : item[key]
        )
          ?.toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );

  const pieData = classes.map((c) => ({
    name: c.nom,
    value: c.etudiants ? c.etudiants.length : 0,
  }));

  const COLORS = [violetDark, violet, violetLight, "#d9b3ff", "#f0e5ff"];

  const drawer = (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <Box
          component="img"
          src={logo}
          alt="Logo entreprise"
          sx={{ height: 160, width: "auto" }}
        />
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1 }}>
        <ListItem
          button
          selected={selectedSection === "users"}
          onClick={() => setSelectedSection("users")}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Utilisateurs" />
        </ListItem>
        <ListItem
          button
          selected={selectedSection === "etudiants"}
          onClick={() => setSelectedSection("etudiants")}
        >
          <ListItemIcon>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText primary="Étudiants" />
        </ListItem>
        <ListItem
          button
          selected={selectedSection === "classes"}
          onClick={() => setSelectedSection("classes")}
        >
          <ListItemIcon>
            <ClassIcon />
          </ListItemIcon>
          <ListItemText primary="Classes" />
        </ListItem>

        {/* Formulaires visible seulement pour ADMIN */}
        {user.role === "ADMIN" && (
          <ListItem
            button
            selected={selectedSection === "formulaires"}
            onClick={() => {
              setSelectedSection("formulaires");
              goToFormulaires();
            }}
          >
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Formulaires" />
          </ListItem>
        )}
      </List>

      <Box
        sx={{
          borderTop: `1px solid ${violetLight}`,
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user.photo ? (
            <Box
              component="img"
              src={user.photo}
              alt="Profil"
              sx={{ width: 55, height: 55, borderRadius: "50%" }}
            />
          ) : (
            <Box
              sx={{
                width: 55,
                height: 55,
                borderRadius: "50%",
                bgcolor: violetLight,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: violetDark,
                fontWeight: "bold",
              }}
            >
              {user.nom ? user.nom.charAt(0).toUpperCase() : "U"}
            </Box>
          )}
          <Typography sx={{ color: violetDark, fontWeight: "bold" }}>
            {user.nom}
          </Typography>
        </Box>
        <Button
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderColor: violetDark, color: violetDark }}
          variant="outlined"
        >
          Se déconnecter
        </Button>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: violetDark,
          flexDirection: "row",
          alignItems: "center",
          p: 1,
        }}
      >
        <IconButton color="inherit" onClick={handleGoHome} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ color: "white" }}>
          Tableau de bord Admin
        </Typography>
        <IconButton
          color="inherit"
          onClick={handleDrawerToggle}
          sx={{ ml: "auto", display: { sm: "none" } }}
        >
          <MenuIcon />
        </IconButton>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              backgroundColor: "#f3eaff",
              borderRight: `3px solid ${violet}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        {/* Statistiques */}
        <Typography
          variant="h5"
          sx={{ mb: 3, color: violetDark, fontWeight: "bold" }}
        >
          Statistiques des étudiants par classe
        </Typography>
        <Box sx={{ width: "100%", height: 320, mb: 5 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                fill={violet}
                label={(entry) => `${entry.name} (${entry.value})`}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <TextField
          label="Recherche..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 3, maxWidth: 400 }}
        />

        {/* Sections existantes */}
        {selectedSection === "users" && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Liste des utilisateurs
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: tableHeight }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(users, ["nom", "email", "role"]).map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.nom}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        <Tooltip title="Modifier">
                          <IconButton>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {selectedSection === "etudiants" && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Liste des étudiants
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: tableHeight }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Classe</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(etudiants, ["nom", "email", "classe.nom"]).map(
                    (e) => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.nom}</TableCell>
                        <TableCell>{e.email}</TableCell>
                        <TableCell>
                          {e.classe ? e.classe.nom : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Modifier">
                            <IconButton>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {selectedSection === "classes" && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Liste des classes
            </Typography>
            <TableContainer component={Paper} sx={{ maxHeight: tableHeight }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nom</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell># Étudiants</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filterData(classes, ["nom", "id"]).map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>{c.nom}</TableCell>
                      <TableCell>{c.id}</TableCell>
                      <TableCell>
                        {c.etudiants ? c.etudiants.length : 0}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Modifier">
                          <IconButton>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      {/* Bouton flottant visible uniquement pour ADMIN et sur la section Formulaires */}
      {user.role === "ADMIN" && selectedSection === "formulaires" && (
        <Fab
          color="primary"
          onClick={goToCreateFormulaire}
          sx={{
            position: "fixed",
            bottom: 30,
            right: 30,
            backgroundColor: violetDark,
            "&:hover": { backgroundColor: violet },
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
}
