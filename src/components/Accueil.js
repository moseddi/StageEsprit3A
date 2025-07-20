import React from 'react';
import { Image, Typography, Button } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import espritLogo from './esprit-logo.png'; // Adjust path as needed
import './Accueil.css';

const { Title, Paragraph } = Typography;

const Accueil = () => {
    const navigate = useNavigate();

    return (
        <div className="accueil-container">
            <div className="accueil-content">
                <Image
                    src={espritLogo}
                    alt="Esprit Logo"
                    width={220}
                    preview={false}
                    className="accueil-logo animate-pulse"
                />
                <Title level={1} className="accueil-title">
                    Bienvenue à ESPRIT
                </Title>
                <Title level={4} className="accueil-subtitle">
                    Votre plateforme de gestion des évaluations
                </Title>
                <Paragraph className="accueil-paragraph">
                    ESPRIT, École Supérieure Privée d'Ingénierie et de Technologie, forme les ingénieurs de demain avec excellence. Notre système d'évaluation numérique simplifie la création et la gestion des formulaires, offrant une expérience fluide et sécurisée pour optimiser le processus académique.
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    icon={<TeamOutlined />}
                    className="accueil-cta bg-red-500 hover:bg-red-600 border-none rounded-lg"
                    onClick={() => navigate('/utilisateurs')}
                >
                    Commencer la Gestion
                </Button>
            </div>
        </div>
    );
};

export default Accueil;