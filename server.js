const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (index.html)
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
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
                                text: `Eres un asistente de viajes. En base a la siguiente descripción de viaje: "${prompt}", por favor, proporciona sugerencias de destinos de viaje que encajen con esta descripción. Responde con un máximo de 3 líneas, incluyendo los nombres de los destinos.`
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

            // Aquí puedes agregar palabras comunes a ignorar
            const commonWords = ["para", "cada", "y", "o", "el", "la", "en", "de", "que", "es", "un", "una", "si", "Te"];

            // Extraer destinos
            const destinations = suggestionText.match(/(?:\b[A-Z][a-záéíóúüñ]*\b(?:\s+[A-Z][a-záéíóúüñ]*\b)*)+/g) || [];

            // Filtrar los destinos para eliminar palabras comunes
            const filteredDestinations = destinations.filter(destination => {
                return !commonWords.includes(destination.toLowerCase());
            });

            // Obtener coordenadas de los destinos usando Nominatim
            const coordinatesPromises = filteredDestinations.map(destination => getCoordinatesFromNominatim(destination));
            const coordinatesResults = await Promise.all(coordinatesPromises);
            const validDestinations = coordinatesResults.filter(result => result !== null);

            res.json({ suggestion: suggestionText, destinations: validDestinations });
        } else {
            res.json({ suggestion: 'No se encontraron sugerencias.', destinations: [] });
        }
    } catch (error) {
        console.error('Error al obtener sugerencias:', error);
        res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
});

// Función para obtener coordenadas usando Nominatim
async function getCoordinatesFromNominatim(destination) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`);
        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                return { name: destination, coords: [parseFloat(lat), parseFloat(lon)] }; // Retorna el nombre del destino y sus coordenadas
            }
        }
    } catch (error) {
        console.error(`Error al buscar coordenadas para ${destination}:`, error);
    }
    return null; // Retorna null si no se encontraron coordenadas
}

app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
