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

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Route to serve 'index.html' from the 'public' folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Your suggestion generation code follows here...
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
                                text: `You are a travel assistant. Based on the following travel description: "${prompt}", please provide travel destination suggestions that match this description. Respond with a maximum of 3 lines, including the destination names and why you chose them.`
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
        console.log('API response:', json);

        if (json.candidates && json.candidates.length > 0) {
            const suggestionText = json.candidates[0].content.parts[0].text;

            const commonWords = ["for", "each", "and", "or", "the", "in", "that", "is", "a", "an", "yes", "you", "are", "also"];

            const destinations = suggestionText.match(/(?:\b[A-Z][a-záéíóúüñ]*\b(?:\s+[A-Z][a-záéíóúüñ]*\b)*)+/g) || [];

            const filteredDestinations = destinations.filter(destination => {
                return !commonWords.includes(destination.toLowerCase());
            });

            const coordinatesPromises = filteredDestinations.map(destination => getCoordinatesFromNominatim(destination));
            const coordinatesResults = await Promise.all(coordinatesPromises);
            const validDestinations = coordinatesResults.filter(result => result !== null);

            res.json({ suggestion: suggestionText, destinations: validDestinations });
        } else {
            res.json({ suggestion: 'No suggestions found.', destinations: [] });
        }
    } catch (error) {
        console.error('Error getting suggestions:', error);
        res.status(500).json({ error: 'Error getting suggestions' });
    }
});

async function getCoordinatesFromNominatim(destination) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`);
        if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon } = data[0];
                return { name: destination, coords: [parseFloat(lat), parseFloat(lon)] };
            }
        }
    } catch (error) {
        console.error(`Error searching for coordinates for ${destination}:`, error);
    }
    return null;
}

app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
