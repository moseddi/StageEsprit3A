import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Admin from './components/Admin';
import Accueil from './components/Accueil';
import { Layout, Menu, theme, Image } from 'antd';
import { HomeOutlined, TeamOutlined, CopyrightOutlined, LogoutOutlined, FormOutlined, BookOutlined, ProfileOutlined } from '@ant-design/icons';
import espritLogo from './esprit-logo.png';
import './App.css';

const { Header, Content, Footer } = Layout;

const AppContent = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('utilisateur');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('utilisateur');
        setCurrentUser(null);
        navigate('/');
    };

    return (
        <Layout className="layout-container">
            <Header className="header">
                <div className="logo-container">
                    <Image src={espritLogo} alt="Esprit Logo" width={150} preview={false} />
                </div>
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    style={{ flex: 1, justifyContent: 'center' }}
                    items={[
                        {
                            key: '1',
                            icon: <HomeOutlined className="text-red-500" />,
                            label: 'Accueil',
                            onClick: () => navigate('/'),
                        },
                        ...(currentUser ? [
                            {
                                key: '2',
                                icon: <TeamOutlined className="text-red-500" />,
                                label: 'Gestion des Utilisateurs',
                                onClick: () => navigate('/utilisateurs'),
                            },
                            {
                                key: '3',
                                icon: <FormOutlined className="text-red-500" />,
                                label: 'Formulaires',
                                onClick: () => navigate('/formulaires'),
                            },
                            {
                                key: '4',
                                icon: <TeamOutlined className="text-red-500" />,
                                label: 'Classes',
                                onClick: () => navigate('/classes'),
                            },
                            {
                                key: '5',
                                icon: <BookOutlined className="text-red-500" />,
                                label: 'Étudiants',
                                onClick: () => navigate('/etudiants'),
                            },
                            {
                                key: '6',
                                icon: <ProfileOutlined className="text-red-500" />,
                                label: 'Profil',
                                onClick: () => navigate('/profil'),
                            },
                            {
                                key: '7',
                                icon: <LogoutOutlined className="text-red-500" />,
                                label: 'Déconnexion',
                                onClick: handleLogout,
                            },
                        ] : []),
                    ]}
                />
            </Header>
            <Content className="px-4 sm:px-6 md:px-10 lg:px-16">
                <div
                    style={{
                        background: colorBgContainer,
                        minHeight: 'calc(100vh - 180px)',
                        borderRadius: borderRadiusLG,
                    }}
                    className="content-container"
                >
                    <Routes>
                        <Route path="/" element={<Accueil />} />
                        <Route
                            path="/utilisateurs"
                            element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />}
                        />
                        <Route
                            path="/formulaires"
                            element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />}
                        />
                        <Route
                            path="/classes"
                            element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />}
                        />
                        <Route
                            path="/etudiants"
                            element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />}
                        />
                        <Route
                            path="/profil"
                            element={<Admin setUserName={(nom) => setCurrentUser(prev => ({ ...prev, nom }))} onLogout={handleLogout} />}
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </div>
            </Content>
            <Footer className="ant-layout-footer">
                <CopyrightOutlined className="text-red-500" /> Système de Gestion ©{new Date().getFullYear()} Créé par Amal
            </Footer>
        </Layout>
    );
};

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;