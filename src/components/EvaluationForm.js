import React, { useEffect, useState } from "react";

const EvaluationForm = () => {
    const [formulaire, setFormulaire] = useState(null);
    const [reponses, setReponses] = useState({});
    const [commentaire, setCommentaire] = useState("");
    const [noteGlobal, setNoteGlobal] = useState("");

    const token = new URLSearchParams(window.location.search).get("token");

    useEffect(() => {
        if (token) {
            fetch(`http://localhost:8081/api/evaluation?token=${token}`)
                .then(res => res.json())
                .then(data => setFormulaire(data))
                .catch(err => console.error("Erreur lors du chargement du formulaire :", err));
        }
    }, [token]);

    const handleChange = (questionId, value) => {
        setReponses(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        const reponseQuestionList = Object.entries(reponses).map(([idQuestion, valeur]) => ({
            idQuestion: parseInt(idQuestion),
            valeur,
        }));

        const reponseFormulaireDTO = {
            commentaire,
            noteGlobal: parseFloat(noteGlobal),
            idFormulaire: formulaire.id,
            reponses: reponseQuestionList,
        };

        try {
            const res = await fetch("http://localhost:8081/api/reponses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reponseFormulaireDTO),
            });

            if (res.ok) {
                alert("Réponses envoyées avec succès !");
            } else {
                alert("Erreur lors de l’envoi !");
            }
        } catch (error) {
            console.error("Erreur d'envoi :", error);
        }
    };

    if (!formulaire) return <p>Chargement du formulaire...</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{formulaire.titre}</h2>
            <p className="mb-4">{formulaire.description}</p>

            {formulaire.questions?.map((question, index) => (
                <div key={question.id} className="mb-3">
                    <label className="font-semibold">{index + 1}. {question.libelle}</label>
                    <input
                        type="text"
                        className="border rounded p-2 w-full mt-1"
                        placeholder="Votre réponse"
                        value={reponses[question.id] || ""}
                        onChange={e => handleChange(question.id, e.target.value)}
                    />
                </div>
            ))}

            <textarea
                className="border rounded p-2 w-full mt-3"
                placeholder="Commentaire"
                value={commentaire}
                onChange={e => setCommentaire(e.target.value)}
            />

            <input
                type="number"
                className="border rounded p-2 w-full mt-3"
                placeholder="Note globale sur 10"
                value={noteGlobal}
                onChange={e => setNoteGlobal(e.target.value)}
            />

            <button
                className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                onClick={handleSubmit}
            >
                Soumettre
            </button>
        </div>
    );
};

export default EvaluationForm;
