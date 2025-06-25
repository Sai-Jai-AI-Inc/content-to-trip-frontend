# Trip Itinerary Web Application

A beautiful, interactive single-page application (SPA) for displaying travel itineraries with timeline visualization and interactive maps. Create engaging presentations of any trip or travel plan with a modern, responsive interface.

## Features

- **Interactive Timeline**: Visual timeline showing trip activities with times and descriptions
- **Interactive Map**: Leaflet-powered map with custom markers and popups
- **Responsive Design**: Mobile-friendly layout that adapts to different screen sizes
- **Modern UI**: Clean, gradient-based design with glassmorphism effects
- **Data-Driven**: Easily customizable through JSON configuration

## Architecture

This is a client-side single-page application built with vanilla web technologies:

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with flexbox/grid, gradients, and glassmorphism effects
- **JavaScript ES6+**: Async/await, fetch API, DOM manipulation
- **Leaflet.js**: Interactive maps with OpenStreetMap tiles
- **Nominatim API**: Geocoding fallback for address-to-coordinates conversion
- **Google Fonts**: Inter font family for clean typography

The application loads trip data from a JSON file and dynamically renders the interface.

## File Structure

```
├── index.html          # Main HTML structure
├── script.js           # JavaScript functionality
├── style.css           # Styling and layout
├── data.json           # Sample trip data
└── README.md           # Project documentation
```

## Getting Started

1. **Clone or download** the project files
2. **Replace the sample data** in `data.json` with your trip information
3. **Open `index.html`** in a web browser

### Running Locally

For best results, serve the files through a local web server to avoid CORS issues:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Data Configuration

The application reads trip data from `data.json`. Replace the sample data with your own trip information using the following structure:

```json
{
  "title": "Trip Title",
  "description": "Trip description",
  "date": "YYYY-MM-DD",
  "duration": 1,
  "entries": [
    {
      "title": "Activity Title",
      "description": "Activity description",
      "address": "Full address",
      "coordinate": [latitude, longitude],
      "date": "YYYY-MM-DD",
      "time": "HH:MM:SS"
    }
  ]
}
```

### Data Fields

- **title**: Main trip title
- **description**: Brief trip overview
- **date**: Trip date in ISO format
- **duration**: Number of days
- **entries**: Array of trip activities with:
  - **title**: Activity name
  - **description**: Detailed description
  - **address**: Full address for display
  - **coordinate**: Optional [lat, lng] array (falls back to geocoding if not provided)
  - **date**: Activity date
  - **time**: Activity time in 24-hour format

## Features in Detail

### Timeline Visualization
- Vertical timeline with gradient line
- Custom markers for each entry
- Time formatting with 12-hour display
- Responsive design for mobile devices

### Interactive Map
- Custom markers with numbered labels
- Popup information for each location
- Auto-fit bounds to show all locations
- Fallback geocoding for addresses without coordinates

### Responsive Design
- Two-column layout on desktop
- Single-column stack on mobile
- Flexible typography scaling
- Touch-friendly interface elements

## Customization

### Styling
Edit `style.css` to customize:
- Color scheme (currently purple gradient theme)
- Typography and spacing
- Component layouts and effects

### Functionality
Modify `script.js` to:
- Change date/time formatting
- Customize map appearance
- Add new features or interactions

### Content
Update `data.json` to:
- Add your own trip destinations and activities
- Set your travel dates and timing
- Customize itinerary entries for your journey

## Browser Compatibility

- Modern browsers with ES6+ support
- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is private and proprietary. All rights reserved.