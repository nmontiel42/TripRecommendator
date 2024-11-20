/*--------------- INDEX.HTML ---------------*/

function redirectToPage() {
    window.location.href = 'layout.html'; // Redirects to layout.html
}

/*--------------- LAYOUT.HTML ---------------*/
let map;
let markersLayer; // Layer for markers

// Initialize the map
function initializeMap() {
    map = L.map('map').setView([20.0, 0.0], 2); // Center of the map and zoom
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);
}

document.getElementById('promptForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const formData = new FormData(this);
    const prompt = formData.get('prompt');
    const responseDiv = document.getElementById('response');
    const loadingDiv = document.getElementById('loading');

    // Show the loading message
    loadingDiv.style.display = 'block';
    responseDiv.innerText = ''; // Clear any previous response

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            throw new Error('Request error');
        }

        const data = await response.json();
        responseDiv.innerText = data.suggestion || 'No suggestions found.';
        displayMap(data.destinations); // Call the function to display the destinations on the map
    } catch (error) {
        console.error('Error:', error);
        responseDiv.innerText = 'There was an error fetching the data.';
    } finally {
        // Hide the loading message
        loadingDiv.style.display = 'none';
    }
});


function displayMap(destinations) {
    // Clear existing markers
    if (markersLayer) {
        map.removeLayer(markersLayer);
    }
    markersLayer = L.layerGroup().addTo(map); // New layer for markers

    // Add markers for each destination
    destinations.forEach(destination => {
        if (destination.coords) {
            const coords = destination.coords; // Get the coordinates of the destination
            L.marker(coords).addTo(markersLayer).bindPopup(destination.name); // Use destination.name for the marker
        }
    });

    // Adjust the map to show all markers
    if (destinations.length > 0) {
        const bounds = L.latLngBounds(destinations.map(d => d.coords));
        map.fitBounds(bounds);
    }
}

initializeMap(); // Initialize the map when the page loads
