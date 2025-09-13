import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Admin from './components/Admin';
import Accueil from './components/Accueil';
import { Layout, Menu, theme, Image } from 'antd';
import { HomeOutlined, TeamOutlined, CopyrightOutlined, LogoutOutlined, FormOutlined, BookOutlined, ProfileOutlined } from '@ant-design/icons';
import espritLogo from './esprit-logo.png';
import './App.css';
import EvaluationFormView from './components/EvaluationFormView';
// Importez vos composants Login et Register
import Login from './components/Login';
import Register from './components/Register';



const { Header, Content, Footer } = Layout;

// Composant principal de l'application
const AppLayout = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [activeView, setActiveView] = useState('login'); // 'login' ou 'register'

    useEffect(() => {
        const storedUser = localStorage.getItem('utilisateur');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLoginSuccess = (user) => {
        localStorage.setItem('utilisateur', JSON.stringify(user));
        setCurrentUser(user);
        navigate('/accueil');
    };

    const handleLogout = () => {
        localStorage.removeItem('utilisateur');
        setCurrentUser(null);
        navigate('/');
    };

    const handleShowLogin = () => setActiveView('login');
    const handleShowRegister = () => setActiveView('register');

    // Détermine les éléments de menu à afficher en fonction de l'état de connexion
    const menuItems = currentUser
        ? [
            { key: '1', icon: <HomeOutlined className="text-red-500" />, label: 'Accueil', onClick: () => navigate('/accueil') },
            { key: '2', icon: <TeamOutlined className="text-red-500" />, label: 'Gestion des Utilisateurs', onClick: () => navigate('/utilisateurs') },
            { key: '3', icon: <FormOutlined className="text-red-500" />, label: 'Formulaires', onClick: () => navigate('/formulaires') },
            { key: '4', icon: <TeamOutlined className="text-red-500" />, label: 'Classes', onClick: () => navigate('/classes') },
            { key: '5', icon: <BookOutlined className="text-red-500" />, label: 'Étudiants', onClick: () => navigate('/etudiants') },
            { key: '6', icon: <ProfileOutlined className="text-red-500" />, label: 'Profil', onClick: () => navigate('/profil') },
            { key: '7', icon: <LogoutOutlined className="text-red-500" />, label: 'Déconnexion', onClick: handleLogout },
        ]
        : [];

    return (
        <Layout className="layout-container" style={{
            backgroundImage: `url('Esprit.jpg')`, // Assurez-vous que l'image est dans le dossier 'public'
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
        }}>
            <Header className="header" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
                <div className="logo-container">
                    <Image src={espritLogo} alt="Esprit Logo" width={150} preview={false} />
                </div>
                {currentUser && (
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                        style={{ flex: 1, justifyContent: 'center', background: 'transparent' }}
                        items={menuItems}
                    />
                )}
            </Header>
            <Content
                className="px-4 sm:px-6 md:px-10 lg:px-16"
                style={{
                    minHeight: 'calc(100vh - 114px)',
                }}
            >
                <div
                    style={{
                        background: currentUser ? colorBgContainer : 'transparent',
                        minHeight: '100%',
                        borderRadius: borderRadiusLG,
                        padding: currentUser ? '24px' : '0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: currentUser ? 'flex-start' : 'center',
                    }}
                    className="content-container"
                >
                    <Routes>
                        {currentUser ? (
                            <>
                                <Route path="/" element={<Accueil />} />
                                <Route path="/accueil" element={<Accueil />} />
                                <Route path="/utilisateurs" element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />} />
                                <Route path="/formulaires" element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />} />
                                <Route path="/classes" element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />} />
                                <Route path="/etudiants" element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />} />
                                <Route path="/profil" element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />} />
                                <Route path="/evaluation-form/:formId" element={<EvaluationFormView />} />
                                <Route path="*" element={<Accueil />} />
                            </>
                        ) : (
                            <>
                                <Route path="/" element={activeView === 'login' ? <Login onLoginSuccess={handleLoginSuccess} onShowRegister={handleShowRegister} /> : <Register onRegisterSuccess={handleLoginSuccess} onShowLogin={handleShowLogin} />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </>
                        )}
                    </Routes>
                </div>
            </Content>
            <Footer className="ant-layout-footer" style={{ background: 'rgba(0, 0, 0, 0.6)' }}>
                <CopyrightOutlined className="text-red-500" /> Système de Gestion ©{new Date().getFullYear()} Créé par Amal
            </Footer>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}

export default App;