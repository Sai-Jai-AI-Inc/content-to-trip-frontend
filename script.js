// Load trip data
async function loadTripData() {
    try {
        const response = await fetch('./data.json');
        const tripData = await response.json();
        return tripData;
    } catch (error) {
        console.error('Error loading trip data:', error);
        return null;
    }
}

// Format time for display
function formatTime(timeString) {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Create timeline entry
function createTimelineEntry(entry) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'timeline-entry';
    
    entryDiv.innerHTML = `
        <div class="entry-time">${formatTime(entry.time)}</div>
        <div class="entry-title">${entry.title}</div>
        <div class="entry-description">${entry.description}</div>
        <div class="entry-address">${entry.address}</div>
    `;
    
    return entryDiv;
}

// Get coordinates from entry data or geocode address
async function getCoordinates(entry) {
    // Use coordinate field if available
    if (entry.coordinate && Array.isArray(entry.coordinate) && entry.coordinate.length === 2) {
        return entry.coordinate;
    }
    
    // Fall back to geocoding the address
    try {
        const encodedAddress = encodeURIComponent(entry.address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`);
        const data = await response.json();
        
        if (data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            console.warn(`Could not geocode address: ${entry.address}`);
            return [9.2037, 123.1914];
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return [9.2037, 123.1914];
    }
}

// Initialize map
async function initializeMap(entries) {
    const map = L.map('map').setView([9.2037, 123.1914], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Custom icon for markers
    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #667eea; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    
    const markers = [];
    
    // Add markers for each entry
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const coords = await getCoordinates(entry);
        const marker = L.marker(coords, { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
            <div class="popup-content">
                <div class="popup-title">${entry.title}</div>
                <div class="popup-time">${formatTime(entry.time)}</div>
                <div class="popup-description">${entry.description}</div>
            </div>
        `);
        
        // Add number label
        const numberIcon = L.divIcon({
            className: 'number-marker',
            html: `<div style="background-color: #764ba2; color: white; width: 25px; height: 25px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">${i + 1}</div>`,
            iconSize: [25, 25],
            iconAnchor: [12.5, 12.5]
        });
        
        L.marker([coords[0] + 0.0005, coords[1] + 0.0005], { icon: numberIcon }).addTo(map);
        markers.push(marker);
    }
    
    // Fit map to show all markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Populate page content
async function populateContent(tripData) {
    // Update header
    document.getElementById('trip-title').textContent = tripData.title;
    document.getElementById('trip-description').textContent = tripData.description;
    document.getElementById('trip-date').textContent = formatDate(tripData.date);
    document.getElementById('trip-duration').textContent = `${tripData.duration} day${tripData.duration > 1 ? 's' : ''}`;
    
    // Create timeline
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    tripData.entries.forEach(entry => {
        const entryElement = createTimelineEntry(entry);
        timeline.appendChild(entryElement);
    });
    
    // Initialize map
    await initializeMap(tripData.entries);
}

// Initialize the application
async function init() {
    const tripData = await loadTripData();
    if (tripData) {
        await populateContent(tripData);
    } else {
        document.body.innerHTML = '<div style="text-align: center; padding: 50px; font-size: 1.2rem; color: #e53e3e;">Error loading trip data. Please check that data.json is available.</div>';
    }
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', init);