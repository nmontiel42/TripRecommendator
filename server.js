const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // Importa path

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (index.html)
app.use(express.static(path.join(__dirname))); // Sirve archivos estáticos desde la raíz del proyecto

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Enviar index.html
});

app.post('/generate', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `Eres un asistente de viajes. En base a la siguiente descripción de viaje: "${prompt}", por favor, proporciona sugerencias de destinos de viaje que encajen con esta descripción. Responde con un máximo de 3 líneas.`
                            }
                        ]
                    }
                ]
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log('Respuesta de la API:', json); // Para depuración

        if (json.candidates && json.candidates.length > 0) {
            const suggestionText = json.candidates[0].content.parts[0].text;
            const limitedSuggestion = suggestionText.split('\n').slice(0, 3).join('\n');
            res.json({ suggestion: limitedSuggestion });
        } else {
            res.json({ suggestion: 'No se encontraron sugerencias.' });
        }
    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
