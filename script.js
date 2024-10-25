/*--------------- INDEX.HTML ---------------*/

function redirectToPage() {
	window.location.href = 'layout.html'; // Redirige a destination.html
}

/*--------------- LAYOUT.HTML ---------------*/
let map;
        let markersLayer; // Capa para los marcadores

        // Inicializar el mapa
        function initializeMap() {
            map = L.map('map').setView([20.0, 0.0], 2); // Centro del mapa y zoom
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
        }

        document.getElementById('promptForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            const prompt = formData.get('prompt');
            const responseDiv = document.getElementById('response');
            
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            
            const data = await response.json();
            responseDiv.innerText = data.suggestion || 'No se encontraron sugerencias.';
            displayMap(data.destinations); // Llama a la función para mostrar los destinos en el mapa
        });

        function displayMap(destinations) {
            // Limpia los marcadores existentes
            if (markersLayer) {
                map.removeLayer(markersLayer);
            }
            markersLayer = L.layerGroup().addTo(map); // Nueva capa para los marcadores

            // Agrega marcadores para cada destino
            destinations.forEach(destination => {
                if (destination.coords) {
                    const coords = destination.coords; // Obtener las coordenadas del destino
                    L.marker(coords).addTo(markersLayer).bindPopup(destination.name); // Usar destination.name para el marcador
                }
            });

            // Ajusta el mapa para mostrar todos los marcadores
            if (destinations.length > 0) {
                const bounds = L.latLngBounds(destinations.map(d => d.coords));
                map.fitBounds(bounds);
            }
        }

        initializeMap(); // Inicializa el mapa al cargar la página