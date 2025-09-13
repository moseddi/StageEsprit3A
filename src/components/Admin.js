import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Button, notification, Tooltip, Space } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  FormOutlined,
  ProfileOutlined,
  SunOutlined,
  MoonOutlined,
} from '@ant-design/icons';
import Login from './Login';
import Register from './Register';
import UserManagement from './UserManagement';
import ClassManagement from './ClassManagement';
import StudentManagement from './StudentManagement';
import FormManagement from './FormManagement';
import UserProfile from './UserProfile';

const { TabPane } = Tabs;

const App = ({ setUserName, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeAuthTab, setActiveAuthTab] = useState('login');
  const [activeManagementTab, setActiveManagementTab] = useState('profil');
  const [theme, setTheme] = useState('dark');

  // Styles réutilisables
  const styles = {
    primaryColor: '#c8102e', // Rouge principal
    secondaryColor: '#991b1b', // Rouge sombre pour survol
    layoutContainer: {
      minHeight: '100vh',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      fontFamily: "'Roboto', sans-serif",
    },
    header: {
      background: '#c8102e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    },
    headerTitle: {
      color: '#c8102e', // Changé en rouge principal
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 700,
      fontSize: '1.75rem',
      padding: '0.5rem 1rem',
      borderRadius: '10px',
    },
    headerBio: {
      color: '#888888', // Changé en gris
      fontFamily: "'Roboto', sans-serif",
      fontSize: '1rem',
      padding: '0 1rem',
      maxWidth: '500px',
      wordBreak: 'break-word',
    },
    headerAvatar: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `2px solid ${theme === 'light' ? '#c8102e' : '#991b1b'}`,
      margin: '0.5rem 1rem',
    },
    contentContainer: {
      padding: '1.5rem',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      minHeight: 'calc(100vh - 180px)',
    },
    adminDashboardContainer: {
      padding: '1.5rem',
      background: theme === 'light' ? '#ffffff' : '#1f1f1f',
      minHeight: 'calc(100vh - 180px)',
    },
    authCard: {
      borderRadius: '20px',
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      padding: '2rem',
    },
    adminHeader: {
      borderRadius: '20px',
      background: theme === 'light' ? '#ffffff' : '#2d2d2d',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    tabBarStyle: {
      background: theme === 'light' ? '#f0f0f0' : '#333333',
      borderRadius: '15px',
      padding: '10px',
      width: '220px',
    },
    tabText: {
      color: '#c8102e',
      fontWeight: 600,
      fontSize: '16px',
    },
    buttonStyle: {
      background: '#c8102e',
      borderColor: '#c8102e',
      color: '#ffffff',
      borderRadius: '15px',
      padding: '8px 20px',
      fontSize: '16px',
      fontWeight: 500,
    },
    iconButtonStyle: {
      background: '#c8102e',
      color: '#ffffff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
    },
  };

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
        console.error('Failed to parse user from localStorage', e);
        localStorage.removeItem('utilisateur');
        notification.error({
          message: 'Erreur',
          description: 'Échec du chargement de l’utilisateur depuis le stockage local.',
          placement: 'topRight',
        });
      }
    }
  }, [setUserName]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (setUserName) {
      setUserName(user.nom);
    }
    localStorage.setItem('utilisateur', JSON.stringify(user));
    notification.success({
      message: 'Succès',
      description: 'Connexion réussie',
      placement: 'topRight',
    });
    setActiveManagementTab('profil');
  };

  const handleRegisterSuccess = () => {
    notification.success({
      message: 'Succès',
      description: 'Compte créé avec succès. Vous pouvez maintenant vous connecter.',
      placement: 'topRight',
    });
    setActiveAuthTab('login');
  };

  const handleUserUpdate = (updatedUser) => {
    setCurrentUser((prevUser) => ({ ...prevUser, ...updatedUser }));
    if (setUserName) {
      setUserName(updatedUser.nom);
    }
    localStorage.setItem('utilisateur', JSON.stringify({ ...currentUser, ...updatedUser }));
    notification.success({
      message: 'Succès',
      description: 'Profil mis à jour avec succès',
      placement: 'topRight',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('utilisateur');
    setCurrentUser(null);
    if (onLogout) {
      onLogout();
    }
    notification.success({
      message: 'Succès',
      description: 'Déconnexion réussie',
      placement: 'topRight',
    });
  };

  return (
      <div style={styles.layoutContainer}>
        {currentUser ? (
            <div style={styles.adminDashboardContainer}>
              <Card style={styles.adminHeader}>
                <Row align="middle" justify="space-between">
                  <Col>
                    {currentUser.avatar ? (
                        <img
                            src={currentUser.avatar}
                            alt="Avatar de l'utilisateur"
                            style={styles.headerAvatar}
                        />
                    ) : (
                        <UserOutlined style={{ ...styles.headerAvatar, fontSize: '60px', color: styles.primaryColor }} />
                    )}
                    <span style={styles.headerTitle}>Bienvenue, {currentUser.nom} !</span>
                    {currentUser.bio && (
                        <div style={styles.headerBio}>{currentUser.bio}</div>
                    )}
                  </Col>
                  <Col>
                    <Space>
                      <Tooltip title={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}>
                        <Button
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            style={styles.iconButtonStyle}
                        >
                          {theme === 'light' ? <MoonOutlined style={{ fontSize: '20px' }} /> : <SunOutlined style={{ fontSize: '20px' }} />}
                        </Button>
                      </Tooltip>
                      <Tooltip title="Se déconnecter">
                        <Button
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={styles.buttonStyle}
                            aria-label="Se déconnecter"
                        >
                          Déconnexion
                        </Button>
                      </Tooltip>
                    </Space>
                  </Col>
                </Row>
              </Card>
              <Tabs
                  activeKey={activeManagementTab}
                  onChange={setActiveManagementTab}
                  size="large"
                  tabPosition="left"
                  style={{ borderRadius: '15px' }}
                  tabBarStyle={styles.tabBarStyle}
              >
                <TabPane
                    tab={
                      <span style={styles.tabText}>
                  <ProfileOutlined /> Mon Profil
                </span>
                    }
                    key="profil"
                >
                  <UserProfile currentUser={currentUser} onUserUpdate={handleUserUpdate} theme={theme} />
                </TabPane>
                {currentUser?.role === 'ADMIN' && (
                    <TabPane
                        tab={
                          <span style={styles.tabText}>
                    <UserOutlined /> Utilisateurs
                  </span>
                        }
                        key="utilisateurs"
                    >
                      <UserManagement currentUser={currentUser} theme={theme} />
                    </TabPane>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <TabPane
                        tab={
                          <span style={styles.tabText}>
                    <TeamOutlined /> Classes
                  </span>
                        }
                        key="classes"
                    >
                      <ClassManagement currentUser={currentUser} theme={theme} />
                    </TabPane>
                )}
                {currentUser?.role === 'ADMIN' && (
                    <TabPane
                        tab={
                          <span style={styles.tabText}>
                    <BookOutlined /> Étudiants
                  </span>
                        }
                        key="etudiants"
                    >
                      <StudentManagement currentUser={currentUser} theme={theme} />
                    </TabPane>
                )}
                <TabPane
                    tab={
                      <span style={styles.tabText}>
                  <FormOutlined /> Formulaires
                </span>
                    }
                    key="formulaires"
                >
                  <FormManagement currentUser={currentUser} theme={theme} />
                </TabPane>
              </Tabs>
            </div>
        ) : (
            <div style={styles.contentContainer}>
              <Row justify="center" align="middle">
                <Col xs={22} sm={18} md={14} lg={10}>
                  <Card style={styles.authCard}>
                    <Tabs
                        activeKey={activeAuthTab}
                        onChange={setActiveAuthTab}
                        centered
                        style={{ borderRadius: '15px' }}
                        tabBarStyle={styles.tabBarStyle}
                    >
                      <TabPane
                          tab={
                            <span style={{ ...styles.tabText, fontSize: '18px' }}>
                        Connexion
                      </span>
                          }
                          key="login"
                      >
                        <Login
                            onLoginSuccess={handleLoginSuccess}
                            onShowRegister={() => setActiveAuthTab('register')}
                        />
                      </TabPane>
                      <TabPane
                          tab={
                            <span style={{ ...styles.tabText, fontSize: '18px' }}>
                        Inscription
                      </span>
                          }
                          key="register"
                      >
                        <Register
                            onRegisterSuccess={handleRegisterSuccess}
                            onShowLogin={() => setActiveAuthTab('login')}
                        />
                      </TabPane>
                    </Tabs>
                  </Card>
                </Col>
              </Row>
            </div>
        )}
      </div>
  );
};

export default App;
