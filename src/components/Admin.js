import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Typography, Button, message } from 'antd';
import { LogoutOutlined, UserOutlined, TeamOutlined, BookOutlined, FormOutlined, ProfileOutlined } from '@ant-design/icons';
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
    const [activeAuthTab, setActiveAuthTab] = useState('login');
    const [activeManagementTab, setActiveManagementTab] = useState('profil');

    useEffect(() => {
        const storedUser = localStorage.getItem('utilisateur');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);
                if (setUserName) {
                    setUserName(user.nom);
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
                localStorage.removeItem('utilisateur');
            }
        }
    }, [setUserName]);

    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        if (setUserName) {
            setUserName(user.nom);
        }
        localStorage.setItem('utilisateur', JSON.stringify(user));
        message.success('Connexion réussie');
        setActiveManagementTab('profil');
    };

    const handleRegisterSuccess = () => {
        message.success('Compte créé avec succès. Vous pouvez maintenant vous connecter.');
        setActiveAuthTab('login');
    };

    const handleUserUpdate = (updatedUser) => {
        setCurrentUser(prevUser => ({ ...prevUser, ...updatedUser }));
        if (setUserName) {
            setUserName(updatedUser.nom);
        }
        localStorage.setItem('utilisateur', JSON.stringify({ ...currentUser, ...updatedUser }));
    };

    return (
        <>
            <style>
                {`
                    /* General layout */
                    .layout-container {
                        min-height: 100vh;
                        background-color: #ffe4e6; /* Light pink background */
                        font-family: 'Roboto', sans-serif;
                    }

                    /* Header styles */
                    .header {
                        background-color: #b91c1c; /* Red for header */
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 0 1rem;
                        box-shadow: 0 4px 8px rgba(185, 28, 28, 0.2);
                    }

                    .logo-container {
                        display: flex;
                        align-items: center;
                    }

                    .logo-image {
                        object-fit: contain;
                    }

                    .header-menu {
                        flex: 1;
                        display: flex;
                        justify-content: center;
                        background-color: #b91c1c; /* Match header red */
                    }

                    .header-menu .ant-menu-item .menu-icon {
                        color: #ff69b4; /* Pink icons */
                        font-size: 1.3rem;
                    }

                    .header-menu .ant-menu-item {
                        color: #ffffff;
                        font-weight: 600;
                        font-size: 1.1rem;
                    }

                    .header-menu .ant-menu-item:hover {
                        color: #ff87b2 !important; /* Lighter pink on hover */
                        background-color: #991b1b; /* Darker red on hover */
                    }

                    /* Content styles */
                    .content-container {
                        padding: 1.5rem;
                    }

                    @media (min-width: 640px) {
                        .content-container {
                            padding: 2rem;
                        }
                    }

                    @media (min-width: 768px) {
                        .content-container {
                            padding: 3rem;
                        }
                    }

                    @media (min-width: 1024px) {
                        .content-container {
                            padding: 4rem;
                        }
                    }

                    .content-inner {
                        background-color: #ffffff;
                        padding: 2rem;
                        border-radius: 12px;
                        box-shadow: 0 6px 12px rgba(255, 105, 180, 0.2);
                        min-height: calc(100vh - 180px);
                    }

                    .content-body {
                        padding: 2rem;
                    }

                    /* Footer styles */
                    .footer {
                        background-color: #b91c1c; /* Red footer */
                        color: #ffffff;
                        text-align: center;
                        padding: 1.5rem 0;
                        font-weight: 500;
                    }

                    .footer-icon {
                        color: #ff69b4; /* Pink icon */
                        margin-right: 0.75rem;
                        font-size: 1.2rem;
                    }

                    /* Admin dashboard styles */
                    .admin-dashboard-container {
                        padding: 1.5rem;
                    }

                    .auth-card {
                        border-radius: 20px;
                        background: #fff0f5; /* Light pink card */
                        box-shadow: 0 8px 16px rgba(255, 105, 180, 0.3);
                        padding: 2rem;
                        animation: float 4s ease-in-out infinite;
                    }

                    .admin-header {
                        border-radius: 20px;
                        background: #fff0f5; /* Light pink card */
                        box-shadow: 0 8px 16px rgba(255, 105, 180, 0.3);
                        padding: 1.5rem;
                        margin-bottom: 1.5rem;
                    }

                    .header-title {
                        color: #ff69b4 !important; /* Pink title */
                        font-family: 'Roboto', sans-serif !important;
                        font-weight: 700;
                        font-size: 1.75rem;
                        text-shadow: none;
                        background: none;
                        -webkit-background-clip: initial;
                        display: inline-block;
                        padding: 0.5rem 1rem;
                        border-radius: 10px;
                    }

                    /* Tabs styles */
                    .admin-tabs .ant-tabs-nav {
                        background: #ffdde1; /* Light pink tab bar */
                        border-radius: 15px;
                        padding: 0.75rem;
                        width: 220px;
                    }

                    .admin-tabs .ant-tabs-tab {
                        color: #ff69b4; /* Pink tab text */
                        font-weight: 600;
                        font-size: 1.1rem;
                    }

                    .admin-tabs .ant-tabs-tab:hover,
                    .admin-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: #b91c1c !important; /* Red on hover/active */
                    }

                    .admin-tabs .ant-tabs-ink-bar {
                        background: #b91c1c; /* Red indicator */
                    }

                    /* Button styles */
                    .ant-btn {
                        border-radius: 12px !important;
                        background: #ff69b4 !important; /* Pink button */
                        border-color: #ff69b4 !important;
                        color: #ffffff !important;
                        font-weight: 600;
                        padding: 0.5rem 1.5rem;
                        transition: all 0.3s ease;
                    }

                    .ant-btn:hover {
                        background: #ff87b2 !important; /* Lighter pink on hover */
                        border-color: #ff87b2 !important;
                    }

                    /* Logout button (specific override) */
                    .ant-btn[onClick] {
                        background: #ff69b4 !important;
                        border-color: #ff69b4 !important;
                    }

                    .ant-btn[onClick]:hover {
                        background: #ff87b2 !important;
                        border-color: #ff87b2 !important;
                    }

                    /* Animation */
                    @keyframes float {
                        0% { transform: translateY(0); }
                        50% { transform: translateY(-8px); }
                        100% { transform: translateY(0); }
                    }

                    /* Responsive adjustments */
                    @media (max-width: 768px) {
                        .header {
                            padding: 0 0.5rem;
                        }

                        .header-menu {
                            justify-content: flex-end;
                        }

                        .header-menu .ant-menu {
                            flex-wrap: wrap;
                        }

                        .header-menu .ant-menu-item {
                            padding: 0 0.75rem;
                            font-size: 1rem;
                        }

                        .admin-tabs .ant-tabs-nav {
                            width: 150px;
                        }

                        .admin-tabs .ant-tabs-tab {
                            font-size: 0.95rem;
                        }

                        .content-container,
                        .admin-dashboard-container {
                            padding: 1rem;
                        }

                        .content-inner,
                        .content-body {
                            padding: 1rem;
                        }
                    }
                `}
            </style>
            {currentUser ? (
                <div className="admin-dashboard-container" style={{ background: '#ffe4e6', minHeight: 'calc(100vh - 180px)' }}>
                    <Card
                        className="admin-header"
                        style={{
                            borderRadius: '20px',
                            background: '#fff0f5',
                            boxShadow: '0 8px 16px rgba(255, 105, 180, 0.3)',
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
                                        fontFamily: 'Roboto',
                                        fontWeight: 700,
                                        fontSize: '1.75rem',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '10px',
                                    }}
                                >
                                    Bienvenue, {currentUser.nom} !
                                </Title>
                            </Col>
                            <Col>
                                <Button
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
                        tabBarStyle={{ background: '#ffdde1', borderRadius: '15px', padding: '10px', width: '220px' }}
                    >
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
            ) : (
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
                                    animation: 'float 4s ease-in-out infinite',
                                }}
                            >
                                <Title
                                    level={2}
                                    style={{
                                        textAlign: 'center',
                                        color: '#ff69b4',
                                        marginBottom: '2rem',
                                        fontFamily: 'Roboto',
                                        fontWeight: 700,
                                        fontSize: '2rem',
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
                                            <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '18px' }}>
                                                Connexion
                                            </span>
                                        }
                                        key="login"
                                    >
                                        <Login onLoginSuccess={handleLoginSuccess} onShowRegister={() => setActiveAuthTab('register')} />
                                    </TabPane>
                                    <TabPane
                                        tab={
                                            <span style={{ color: '#ff69b4', fontWeight: 'bold', fontSize: '18px' }}>
                                                Inscription
                                            </span>
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
            )}
        </>
    );
};

export default App;