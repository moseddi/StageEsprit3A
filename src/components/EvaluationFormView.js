// ✅ src/components/EvaluationFormView.js
import React, { useState, useEffect } from "react";
import { Form, Input, Button, notification, Spin } from "antd";
import axios from "axios";
import { useLocation } from "react-router-dom";

const EvaluationFormView = () => {
    const location = useLocation();
    const [form] = Form.useForm();
    const [formulaire, setFormulaire] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    // ✅ Extraire le token depuis l'URL
    const getTokenFromURL = () => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get("token");
    };

    useEffect(() => {
        const token = getTokenFromURL();
        if (!token) {
            notification.error({ message: "Token manquant dans l'URL" });
            return;
        }

        const userId = parseInt(localStorage.getItem("userId"), 10);
        localStorage.setItem("evaluationToken", token);

        const fetchFormulaire = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8081/api/evaluation/formulaire?token=${token}`
                );
                setFormulaire(res.data);
                const questionsRes = await axios.get(
                    `http://localhost:8081/api/question/formulaire/${res.data.id}`
                );
                setQuestions(questionsRes.data);
            } catch (error) {
                notification.error({
                    message: "Erreur chargement formulaire",
                    description: error.response?.data || error.message,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchFormulaire();
    }, [location.search]);

    const handleSubmit = async (values) => {
        const userId = parseInt(localStorage.getItem("userId"), 10);
        const token = localStorage.getItem("evaluationToken");
        const formId = formulaire?.id;

        if (!formId || !token || !userId) {
            notification.error({
                message: "Erreur",
                description: `Données manquantes pour la soumission: formId=${formId}, userId=${userId}, token=${token}`,
            });
            return;
        }

        const answers = Object.keys(values).map((key) => ({
            questionId: parseInt(key.replace("question_", ""), 10),
            userId,
            texte: values[key],
        }));

        try {
            await axios.post(
                `http://localhost:8081/api/evaluation/submit?formId=${formId}`,
                answers,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Evaluation-Token": token,
                        "X-User-Id": userId,
                    },
                }
            );

            notification.success({
                message: "Succès",
                description: "Évaluation soumise avec succès",
            });
            setSubmitted(true);
        } catch (error) {
            notification.error({
                message: "Erreur soumission",
                description: error.response?.data || error.message,
            });
        }
    };

    if (loading) return <Spin tip="Chargement du formulaire..." />;

    if (submitted) return <h2>Merci pour votre réponse !</h2>;

    return (
        <div>
            <h2>{formulaire?.titre}</h2>
            <p>{formulaire?.description}</p>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {questions.map((q) => (
                    <Form.Item
                        key={q.id}
                        label={q.texte}
                        name={`question_${q.id}`}
                        rules={[{ required: true, message: "Veuillez répondre à cette question." }]}
                    >
                        <Input.TextArea rows={2} placeholder="Votre réponse ici..." />
                    </Form.Item>
                ))}
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Soumettre
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EvaluationFormView;
