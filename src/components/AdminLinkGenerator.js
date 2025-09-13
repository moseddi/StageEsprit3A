import React, { useState } from 'react';
import { Button, Input, message } from 'antd';
import axios from 'axios';

const AdminLinkGenerator = () => {
    const [formId, setFormId] = useState('1');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendLink = async () => {
        if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            message.error('Veuillez entrer une adresse email valide');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken'); // Replace with your JWT token
            if (!token) {
                throw new Error('No auth token found');
            }
            const response = await axios.post(
                'http://localhost:8080/api/evaluation/send-link',
                null,
                {
                    params: { formId, recipientEmail },
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            message.success(response.data);
        } catch (error) {
            console.error('Error sending link:', error);
            message.error(error.response?.data || 'Échec de l\'envoi de l\'email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 20, background: '#f5f5f5' }}>
            <Input
                placeholder="ID du formulaire"
                value={formId}
                onChange={(e) => setFormId(e.target.value)}
                style={{ marginBottom: 10, width: 200, borderRadius: 5 }}
            />
            <Input
                placeholder="Adresse email du destinataire"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                style={{ marginBottom: 10, width: 200, borderRadius: 5 }}
            />
            <Button
                type="primary"
                onClick={handleSendLink}
                loading={loading}
                style={{ background: '#c8102e', borderColor: '#c8102e', borderRadius: 5 }}
            >
                Envoyer
            </Button>
        </div>
    );
};

export default AdminLinkGenerator;