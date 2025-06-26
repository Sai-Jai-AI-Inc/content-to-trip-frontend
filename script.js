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

// Group entries by day
function groupEntriesByDay(entries) {
    const grouped = {};
    entries.forEach(entry => {
        const day = entry.day || '1';
        if (!grouped[day]) {
            grouped[day] = [];
        }
        grouped[day].push(entry);
    });
    return grouped;
}

// Create day header
function createDayHeader(dayNumber, entriesCount) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day-header';
    dayDiv.innerHTML = `
        <h3>Day ${dayNumber}</h3>
        <span class="day-count">${entriesCount} activit${entriesCount === 1 ? 'y' : 'ies'}</span>
    `;
    return dayDiv;
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
            return null;
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

// Initialize map
async function initializeMap(entries) {
    // Get coordinates for all entries first
    const coordsPromises = entries.map(entry => getCoordinates(entry));
    const allCoords = await Promise.all(coordsPromises);

    // Filter out null coordinates
    const validCoords = allCoords.filter(coords => coords !== null);

    if (validCoords.length === 0) {
        // No valid coordinates, show empty map
        const map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        return;
    }

    // Initialize map with first valid coordinate
    const map = L.map('map').setView(validCoords[0], 14);
    
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
    
    // Add markers for each entry with valid coordinates
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const coords = allCoords[i];

        if (coords === null) {
            console.warn(`Skipping marker for "${entry.title}" - no valid coordinates`);
            continue;
        }

        const marker = L.marker(coords, { icon: customIcon }).addTo(map);
        
        marker.bindPopup(`
            <div class="popup-content">
                <div class="popup-title">${entry.title}</div>
                <div class="popup-time">${formatTime(entry.time)}</div>
                <div class="popup-description">${entry.description}</div>
            </div>
        `);

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
    // Update page title
    document.title = tripData.title + ' - Trip Itinerary';
    
    // Update header
    document.getElementById('trip-title').textContent = tripData.title;
    document.getElementById('trip-description').textContent = tripData.description;
    document.getElementById('trip-duration').textContent = `${tripData.duration} day${tripData.duration > 1 ? 's' : ''}`;
    
    // Update author info if available
    if (tripData.author && tripData.author.full_name && tripData.author.ig_url) {
        const authorSection = document.getElementById('author-section');
        const authorLink = document.getElementById('trip-author');
        const authorAvatar = document.getElementById('author-avatar');
        
        authorLink.textContent = tripData.author.full_name;
        authorLink.href = tripData.author.ig_url;
        
        // Add profile image if available
        if (tripData.author.profile_img) {
            authorAvatar.src = tripData.author.profile_img;
            authorAvatar.alt = tripData.author.full_name;
            authorAvatar.style.display = 'inline-block';
        }
        
        authorSection.style.display = 'flex';
    }
    
    // Update source link
    if (tripData.source_url) {
        const originalSection = document.getElementById('original-section');
        const sourceLink = document.getElementById('source-link');
        sourceLink.href = tripData.source_url;
        originalSection.style.display = 'block';
    }
    
    // Update OTA buttons
    if (tripData.ota && Array.isArray(tripData.ota) && tripData.ota.length > 0) {
        const bookingSection = document.getElementById('booking-section');
        const otaContainer = document.getElementById('ota-buttons');
        otaContainer.innerHTML = '';
        
        tripData.ota.forEach(ota => {
            if (ota.provider && ota.url) {
                const otaButton = document.createElement('a');
                otaButton.className = 'ota-btn';
                otaButton.href = ota.url;
                otaButton.target = '_blank';
                
                // Capitalize provider name
                const providerName = ota.provider.charAt(0).toUpperCase() + ota.provider.slice(1);
                otaButton.textContent = `Book on ${providerName}`;
                
                otaContainer.appendChild(otaButton);
            }
        });
        
        bookingSection.style.display = 'block';
        
        // Also populate CTA section
        populateCTASection(tripData.ota);
    }
    
    // Create timeline grouped by day
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    
    const groupedEntries = groupEntriesByDay(tripData.entries);
    const sortedDays = Object.keys(groupedEntries).sort((a, b) => parseInt(a) - parseInt(b));

    sortedDays.forEach(day => {
        const dayEntries = groupedEntries[day];

        // Add day header
        const dayHeader = createDayHeader(day, dayEntries.length);
        timeline.appendChild(dayHeader);

        // Add entries for this day
        dayEntries.forEach(entry => {
            const entryElement = createTimelineEntry(entry);
            timeline.appendChild(entryElement);
        });
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

// Populate CTA section
function populateCTASection(otaProviders) {
    const ctaSection = document.getElementById('cta-section');
    const ctaButtons = document.getElementById('cta-buttons');
    
    if (otaProviders && otaProviders.length > 0) {
        ctaButtons.innerHTML = '';
        
        otaProviders.forEach((ota, index) => {
            if (ota.provider && ota.url) {
                const ctaButton = document.createElement('a');
                ctaButton.className = 'cta-btn';
                ctaButton.href = ota.url;
                ctaButton.target = '_blank';
                
                // Create compelling CTA text based on provider
                let ctaText = '';
                if (ota.provider.toLowerCase().includes('trip')) {
                    ctaText = '🌟 Book with Trip.com - Best Prices Guaranteed!';
                } else if (ota.provider.toLowerCase().includes('agoda')) {
                    ctaText = '🏆 Book with Agoda - Instant Confirmation!';
                } else {
                    const providerName = ota.provider.charAt(0).toUpperCase() + ota.provider.slice(1);
                    ctaText = `🎯 Book with ${providerName} - Start Your Adventure!`;
                }
                
                ctaButton.innerHTML = `
                    <span class="cta-btn-text">${ctaText}</span>
                    <span class="cta-btn-arrow">→</span>
                `;
                
                // Add special styling for primary CTA
                if (index === 0) {
                    ctaButton.classList.add('cta-btn-primary');
                }
                
                ctaButtons.appendChild(ctaButton);
            }
        });
        
        ctaSection.style.display = 'block';
    }
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', init);