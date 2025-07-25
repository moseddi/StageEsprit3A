// src/components/Admin.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Typography, Button, message } from 'antd';
import { LogoutOutlined, UserOutlined, TeamOutlined, BookOutlined, FormOutlined, ProfileOutlined } from '@ant-design/icons';
import '../App.css'; // Assurez-vous que votre CSS global est toujours là
// Importez les composants séparés
import Login from './Login';
import Register from './Register';
import UserManagement from './UserManagement';
import ClassManagement from './ClassManagement';
import StudentManagement from './StudentManagement';
import FormManagement from './FormManagement';
import UserProfile from './UserProfile';

const { TabPane } = Tabs;
const { Title } = Typography;

const App = ({ setUserName, onLogout }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activeAuthTab, setActiveAuthTab] = useState('login'); // Pour les onglets de connexion/inscription
    const [activeManagementTab, setActiveManagementTab] = useState('profil'); // Défini sur 'profil' par défaut après connexion

    useEffect(() => {
        // Au chargement du composant, tente de récupérer l'utilisateur depuis le localStorage
        const storedUser = localStorage.getItem('utilisateur');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                // Met à jour le nom d'utilisateur dans le composant parent (ex: App.js pour la barre de navigation)
                if (setUserName) {
                    setUserName(user.nom);
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('utilisateur'); // Nettoyer les données corrompues
            }
        }
    }, [setUserName]);

    // Fonction appelée en cas de succès de la connexion
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        if (setUserName) {
            setUserName(user.nom);
        }
        localStorage.setItem('utilisateur', JSON.stringify(user)); // Stocke l'utilisateur dans le localStorage
        message.success('Connexion réussie');
        setActiveManagementTab('profil'); // Passe à l'onglet profil après connexion
    };

    // Fonction appelée en cas de succès de l'inscription
    const handleRegisterSuccess = () => {
        message.success('Compte créé avec succès. Vous pouvez maintenant vous connecter.');
        setActiveAuthTab('login'); // Bascule vers l'onglet de connexion après l'inscription
    };

    // Fonction pour gérer la mise à jour des données de l'utilisateur (utilisée par UserProfile)
    const handleUserUpdate = (updatedUser) => {
        // Met à jour l'état local de l'utilisateur en fusionnant les champs mis à jour
        setCurrentUser(prevUser => ({ ...prevUser, ...updatedUser }));
        if (setUserName) {
            // Met à jour le nom d'utilisateur affiché dans la barre de navigation
            setUserName(updatedUser.nom);
        }
        // Met à jour le localStorage pour que les changements persistent après un rechargement
        localStorage.setItem('utilisateur', JSON.stringify({ ...currentUser, ...updatedUser }));
    };

    // Si aucun utilisateur n'est connecté, affiche les formulaires de connexion/inscription
    if (!currentUser) {
        return (
            <div className="content-container" style={{ background: '#ffe4e6', minHeight: 'calc(100vh - 180px)' }}>
                <Row justify="center" align="middle">
                    <Col xs={22} sm={18} md={14} lg={10}>
                        <Card
                            className="auth-card"
                            style={{
                                borderRadius: '20px',
                                background: '#fff0f5',
                                boxShadow: '0 8px 16px rgba(255, 105, 180, 0.3)',
                                padding: '2rem',
                                animation: 'float 3s ease-in-out infinite',
                            }}
                        >
                            <Title
                                level={2}
                                style={{
                                    textAlign: 'center',
                                    color: '#ff69b4',
                                    marginBottom: '2rem',
                                    fontFamily: 'cursive',
                                    textShadow: '2px 2px 4px rgba(255, 105, 180, 0.3)',
                                }}
                            >
                                <TeamOutlined className="text-pink-500 text-4xl mr-2" />
                                Système de Gestion des Évaluations
                            </Title>
                            <Tabs
                                activeKey={activeAuthTab}
                                onChange={setActiveAuthTab}
                                centered
                                style={{ borderRadius: '15px' }}
                                tabBarStyle={{ background: '#ffdde1', borderRadius: '15px', padding: '10px' }}
                            >
                                <TabPane
                                    tab={
                                        <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '18px' }}>Connexion</span>
                                    }
                                    key="login"
                                >
                                    <Login onLoginSuccess={handleLoginSuccess} onShowRegister={() => setActiveAuthTab('register')} />
                                </TabPane>
                                <TabPane
                                    tab={
                                        <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '18px' }}>Inscription</span>
                                    }
                                    key="register"
                                >
                                    <Register onRegisterSuccess={handleRegisterSuccess} onShowLogin={() => setActiveAuthTab('login')} />
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    }

    // Si un utilisateur est connecté, affiche le tableau de bord d'administration ou les onglets évaluateurs
    return (
        <div className="admin-dashboard-container" style={{ background: '#ffe4e6', minHeight: 'calc(100vh - 180px)' }}>
            <Card
                className="admin-header"
                style={{
                    borderRadius: '20px',
                    background: '#fff0f5',
                    boxShadow: '0 8px 16px rgba(255, 105, 180, 0.3)',
                    marginBottom: '20px',
                    padding: '1.5rem',
                }}
            >
                <Row align="middle" justify="space-between">
                    <Col>
                        <Title
                            level={3}
                            className="header-title"
                            style={{
                                color: '#ff69b4',
                                fontFamily: 'cursive',
                                textShadow: '1px 1px 3px rgba(255, 105, 180, 0.3)',
                                background: 'linear-gradient(90deg, #ff69b4, #ff87b2)',
                                WebkitBackgroundClip: 'text',

                                display: 'inline-block',
                                padding: '0 10px',
                                borderRadius: '10px',
                            }}
                        >
                            Bienvenue, {currentUser.nom} !
                        </Title>
                    </Col>
                    <Col>
                        <Button
                            type="danger"
                            icon={<LogoutOutlined />}
                            onClick={onLogout}
                            style={{
                                borderRadius: '15px',
                                background: '#ff69b4',
                                borderColor: '#ff69b4',
                                transition: 'all 0.3s ease',
                                padding: '8px 20px',
                                fontSize: '16px',
                                fontWeight: '500',
                            }}
                            onMouseEnter={(e) => { e.target.style.background = '#ff87b2'; e.target.style.borderColor = '#ff87b2'; }}
                            onMouseLeave={(e) => { e.target.style.background = '#ff69b4'; e.target.style.borderColor = '#ff69b4'; }}
                        >
                            Déconnexion
                        </Button>
                    </Col>
                </Row>
            </Card>
            <Tabs
                activeKey={activeManagementTab}
                onChange={setActiveManagementTab}
                className="admin-tabs"
                size="large"
                tabPosition="left"
                style={{ borderRadius: '15px' }}
                tabBarStyle={{ background: '#ffdde1', borderRadius: '15px', padding: '10px', width: '200px' }}
            >
                {/* Onglet "Mon Profil" accessible à tous les utilisateurs connectés */}
                <TabPane
                    tab={
                        <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '16px' }}>
              <ProfileOutlined /> Mon Profil
            </span>
                    }
                    key="profil"
                >
                    <UserProfile currentUser={currentUser} onUserUpdate={handleUserUpdate} />
                </TabPane>
                {/* Onglets spécifiques à l'administrateur (rôle ADMIN) */}
                {currentUser?.role === 'ADMIN' && (
                    <TabPane
                        tab={
                            <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '16px' }}>
                <UserOutlined /> Utilisateurs
              </span>
                        }
                        key="utilisateurs"
                    >
                        <UserManagement currentUser={currentUser} />
                    </TabPane>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <TabPane
                        tab={
                            <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '16px' }}>
                <TeamOutlined /> Classes
              </span>
                        }
                        key="classes"
                    >
                        <ClassManagement currentUser={currentUser} />
                    </TabPane>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <TabPane
                        tab={
                            <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '16px' }}>
                <BookOutlined /> Étudiants
              </span>
                        }
                        key="etudiants"
                    >
                        <StudentManagement currentUser={currentUser} />
                    </TabPane>
                )}
                {/* L'onglet "Formulaires" est accessible aux ADMINS et aux EVALUATORS */}
                <TabPane
                    tab={
                        <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '16px' }}>
              <FormOutlined /> Formulaires
            </span>
                    }
                    key="formulaires"
                >
                    <FormManagement currentUser={currentUser} />
                </TabPane>
            </Tabs>
        </div>
    );
};

// Ajoutez cette animation CSS dans App.css ou un fichier CSS séparé
const styles = `
  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0); }
  }
`;

export default App;