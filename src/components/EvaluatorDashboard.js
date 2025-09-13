import React, { useState, useEffect } from 'react';
import { Button, message, Spin } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const EvaluatorDashboard = ({ currentUser, theme }) => {
    const [evaluationLink, setEvaluationLink] = useState(null);
    const [loading, setLoading] = useState(false);

    const styles = {
        primaryColor: '#c8102e',
        containerStyle: { padding: '20px', borderRadius: '12px', background: theme === 'light' ? '#ffffff' : '#1f1f1f', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' },
        buttonStyle: { background: '#c8102e', color: '#ffffff', borderRadius: '8px', transition: 'all 0.3s ease', padding: '6px 12px', fontSize: '16px', border: 'none' },
    };

    useEffect(() => {
        const fetchEvaluationLink = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:8080/api/evaluation/user-link', {
                    headers: { 'X-User-Id': currentUser.id }
                });
                setEvaluationLink(response.data);
            } catch (error) {
                message.error(error.response?.data || 'Aucun lien d\'évaluation trouvé');
            } finally {
                setLoading(false);
            }
        };
        if (currentUser?.id) {
            fetchEvaluationLink();
        }
    }, [currentUser?.id]);

    return (
        <div style={styles.containerStyle}>
            <Spin spinning={loading}>
                <h2 style={{ color: styles.primaryColor }}>Tableau de bord évaluateur</h2>
                {evaluationLink ? (
                    <Link to={evaluationLink}>
                        <Button type="primary" style={styles.buttonStyle}>Accéder au formulaire d'évaluation</Button>
                    </Link>
                ) : (
                    <p>Aucun formulaire assigné</p>
                )}
            </Spin>
        </div>
    );
};

export default EvaluatorDashboard;