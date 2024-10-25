// pages/api/generate.js

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { prompt } = req.body;
        
        // Lógica para procesar el `prompt` y generar sugerencias
        
        const data = {
            suggestion: 'Ejemplo de sugerencia basada en el prompt',
            destinations: [
                { name: 'Lugar A', coords: [19.432608, -99.133209] },
                { name: 'Lugar B', coords: [40.712776, -74.005974] },
            ],
        };

        res.status(200).json(data);
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
